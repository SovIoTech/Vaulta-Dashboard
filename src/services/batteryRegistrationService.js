// src/services/batteryRegistrationService.js
import { fetchAuthSession } from "aws-amplify/auth";
import AWS from "aws-sdk";
import awsconfig from "../aws-exports.js";
import { useState, useEffect } from "react";

class BatteryRegistrationService {
  constructor() {
    // Initialize AWS SDK region from config
    AWS.config.update({ region: awsconfig.aws_project_region });
  }

  // Initialize AWS Lambda client with proper credentials
  async initializeLambda() {
    try {
      const session = await fetchAuthSession();
      const credentials = session.credentials;

      if (!credentials) {
        throw new Error("No valid credentials found. Please log in again.");
      }

      return new AWS.Lambda({
        region: awsconfig.aws_project_region,
        credentials,
      });
    } catch (error) {
      console.error("Error initializing Lambda client:", error);
      throw new Error(
        "Failed to initialize AWS services. Please check your authentication."
      );
    }
  }

  // Get current user ID from Cognito
  async getCurrentUserId() {
    try {
      const session = await fetchAuthSession();
      if (!session.identityId) {
        throw new Error("No user identity found. Please log in again.");
      }
      return session.identityId;
    } catch (error) {
      console.error("Error getting user ID:", error);
      throw new Error("Failed to get user identity. Please log in again.");
    }
  }

  // Parse Lambda response and handle errors
  parseLambdaResponse(response) {
    try {
      const result = JSON.parse(response.Payload);

      if (result.statusCode >= 200 && result.statusCode < 300) {
        return JSON.parse(result.body);
      } else {
        // Handle Lambda function errors
        let errorMessage = "An error occurred";
        try {
          const errorBody = JSON.parse(result.body);
          errorMessage = errorBody.message || errorBody.error || errorMessage;
        } catch (e) {
          errorMessage = result.body || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Invalid response from server");
      }
      throw error;
    }
  }

  // Register a new battery
  async registerBattery(batteryData) {
    try {
      const lambda = await this.initializeLambda();
      const userId = await this.getCurrentUserId();

      // Validate required fields
      if (!batteryData.serialNumber?.trim()) {
        throw new Error("Serial number is required");
      }
      if (!batteryData.batteryId?.trim()) {
        throw new Error("Battery ID is required");
      }

      const payload = {
        body: JSON.stringify({
          userId,
          serialNumber: batteryData.serialNumber.trim(),
          batteryId: batteryData.batteryId.trim(),
          batteryName: batteryData.batteryName?.trim() || "",
          location: batteryData.location?.trim() || "",
        }),
      };

      console.log("Invoking registerBattery Lambda with payload:", payload);

      const response = await lambda
        .invoke({
          FunctionName: "registerBattery",
          InvocationType: "RequestResponse",
          Payload: JSON.stringify(payload),
        })
        .promise();

      return this.parseLambdaResponse(response);
    } catch (error) {
      console.error("Error registering battery:", error);
      throw new Error(
        error.message || "Failed to register battery. Please try again."
      );
    }
  }

  // Get user's registered batteries
  async getUserBatteries() {
    try {
      const lambda = await this.initializeLambda();
      const userId = await this.getCurrentUserId();

      const payload = {
        pathParameters: { userId },
        queryStringParameters: { userId },
      };

      console.log("Invoking getUserBatteries Lambda with payload:", payload);

      const response = await lambda
        .invoke({
          FunctionName: "getUserBatteries",
          InvocationType: "RequestResponse",
          Payload: JSON.stringify(payload),
        })
        .promise();

      const result = this.parseLambdaResponse(response);
      return result.batteries || [];
    } catch (error) {
      console.error("Error fetching user batteries:", error);
      throw new Error(
        error.message || "Failed to fetch your batteries. Please try again."
      );
    }
  }

  // Manage battery (activate/deactivate)
  async manageBattery(registrationId, action = "deactivate") {
    try {
      const lambda = await this.initializeLambda();
      const userId = await this.getCurrentUserId();

      if (!registrationId?.trim()) {
        throw new Error("Registration ID is required");
      }

      const payload = {
        body: JSON.stringify({
          userId,
          registrationId: registrationId.trim(),
          action,
        }),
      };

      console.log("Invoking manageBattery Lambda with payload:", payload);

      const response = await lambda
        .invoke({
          FunctionName: "manageBattery",
          InvocationType: "RequestResponse",
          Payload: JSON.stringify(payload),
        })
        .promise();

      return this.parseLambdaResponse(response);
    } catch (error) {
      console.error("Error managing battery:", error);
      throw new Error(
        error.message || `Failed to ${action} battery. Please try again.`
      );
    }
  }

  // Convenience method for deactivating batteries
  async deactivateBattery(registrationId) {
    return this.manageBattery(registrationId, "deactivate");
  }

  // Convenience method for activating batteries
  async activateBattery(registrationId) {
    return this.manageBattery(registrationId, "activate");
  }

  // Validate battery access for data fetching
  async validateBatteryAccess(serialNumber, batteryId) {
    try {
      const userBatteries = await this.getUserBatteries();

      return userBatteries.some(
        (battery) =>
          battery.serialNumber === serialNumber &&
          battery.batteryId === batteryId &&
          battery.isActive === true
      );
    } catch (error) {
      console.error("Error validating battery access:", error);
      return false;
    }
  }

  // Get user's accessible battery IDs for dropdown filtering
  async getAccessibleBatteryIds() {
    try {
      const userBatteries = await this.getUserBatteries();

      return userBatteries
        .filter((battery) => battery.isActive === true)
        .map((battery) => ({
          serialNumber: battery.serialNumber,
          batteryId: battery.batteryId,
          batteryName:
            battery.batteryName ||
            `${battery.serialNumber} - ${battery.batteryId}`,
          location: battery.location || "",
          registrationId: battery.registrationId,
          value: battery.batteryId, // For dropdown compatibility
          label:
            battery.batteryName ||
            `${battery.serialNumber} - ${battery.batteryId}`, // For dropdown compatibility
        }));
    } catch (error) {
      console.error("Error getting accessible battery IDs:", error);
      return [];
    }
  }

  // Check if user has any registered batteries
  async hasRegisteredBatteries() {
    try {
      const batteries = await this.getUserBatteries();
      return batteries.length > 0;
    } catch (error) {
      console.error("Error checking registered batteries:", error);
      return false;
    }
  }

  // Check if user has any active registered batteries
  async hasActiveBatteries() {
    try {
      const batteries = await this.getUserBatteries();
      return batteries.some((battery) => battery.isActive === true);
    } catch (error) {
      console.error("Error checking active batteries:", error);
      return false;
    }
  }

  // Get battery details by registration ID
  async getBatteryDetails(registrationId) {
    try {
      const userBatteries = await this.getUserBatteries();
      return userBatteries.find(
        (battery) => battery.registrationId === registrationId
      );
    } catch (error) {
      console.error("Error getting battery details:", error);
      return null;
    }
  }
}

// Create singleton instance
const batteryRegistrationService = new BatteryRegistrationService();

export default batteryRegistrationService;

// Enhanced React Hook for battery registration with comprehensive state management
export const useBatteryRegistration = () => {
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasRegistrations, setHasRegistrations] = useState(false);
  const [hasActiveBatteries, setHasActiveBatteries] = useState(false);

  // Load user's batteries
  const loadBatteries = async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true);
    setError(null);

    try {
      const userBatteries = await batteryRegistrationService.getUserBatteries();
      setBatteries(userBatteries);
      setHasRegistrations(userBatteries.length > 0);
      setHasActiveBatteries(
        userBatteries.some((battery) => battery.isActive === true)
      );
      return userBatteries;
    } catch (err) {
      console.error("Error loading batteries:", err);
      setError(err.message);
      setBatteries([]);
      setHasRegistrations(false);
      setHasActiveBatteries(false);
      throw err;
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  // Register new battery
  const registerBattery = async (batteryData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await batteryRegistrationService.registerBattery(
        batteryData
      );
      await loadBatteries(false); // Reload batteries without loading state
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Deactivate battery
  const deactivateBattery = async (registrationId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await batteryRegistrationService.deactivateBattery(
        registrationId
      );
      await loadBatteries(false); // Reload batteries without loading state
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Activate battery
  const activateBattery = async (registrationId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await batteryRegistrationService.activateBattery(
        registrationId
      );
      await loadBatteries(false); // Reload batteries without loading state
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get accessible battery options for dropdowns
  const getAccessibleOptions = () => {
    return batteries
      .filter((battery) => battery.isActive === true)
      .map((battery) => ({
        value: battery.batteryId,
        label:
          battery.batteryName ||
          `${battery.serialNumber} - ${battery.batteryId}`,
        serialNumber: battery.serialNumber,
        batteryId: battery.batteryId,
        location: battery.location,
        registrationId: battery.registrationId,
      }));
  };

  // Validate access to specific battery
  const validateAccess = async (serialNumber, batteryId) => {
    try {
      return await batteryRegistrationService.validateBatteryAccess(
        serialNumber,
        batteryId
      );
    } catch (err) {
      console.error("Error validating access:", err);
      return false;
    }
  };

  // Clear error state
  const clearError = () => setError(null);

  // Initialize hook
  useEffect(() => {
    loadBatteries();
  }, []);

  return {
    batteries,
    loading,
    error,
    hasRegistrations,
    hasActiveBatteries,
    registerBattery,
    deactivateBattery,
    activateBattery,
    loadBatteries,
    getAccessibleOptions,
    validateAccess,
    clearError,
    // Service methods for direct access if needed
    service: batteryRegistrationService,
  };
};
