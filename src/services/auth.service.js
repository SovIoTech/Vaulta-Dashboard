// src/services/auth.service.js (Updated with React Context Provider)
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  fetchAuthSession,
  signOut as amplifySignOut,
  getCurrentUser as amplifyGetCurrentUser,
} from "aws-amplify/auth";
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import config from "../config/index.js";

// Create Auth Context
const AuthContext = createContext();

class AuthService {
  constructor() {
    this.cognitoClient = null;
    this.currentUser = null;
    this.session = null;
  }

  /**
   * Initialize Cognito client with current credentials
   */
  async initializeCognitoClient() {
    try {
      if (this.cognitoClient) return this.cognitoClient;

      const session = await fetchAuthSession();
      const { accessKeyId, secretAccessKey, sessionToken } =
        session.credentials;

      this.cognitoClient = new CognitoIdentityProvider({
        region: config.aws.cognito.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
          sessionToken,
        },
      });

      return this.cognitoClient;
    } catch (error) {
      console.error("Error initializing Cognito client:", error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    try {
      if (this.currentUser) return this.currentUser;

      const user = await amplifyGetCurrentUser();
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Get current auth session
   */
  async getSession() {
    try {
      if (this.session) return this.session;

      const session = await fetchAuthSession();
      this.session = session;
      return session;
    } catch (error) {
      console.error("Error getting auth session:", error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      const session = await this.getSession();
      return (
        session && session.tokens && !session.tokens.accessToken.isExpired()
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      await amplifySignOut();
      this.currentUser = null;
      this.session = null;
      this.cognitoClient = null;
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user details with attributes
   */
  async getUserDetails() {
    try {
      const session = await this.getSession();
      const user = await this.getCurrentUser();

      if (!user || !session) return null;

      return {
        username: user.username,
        userId: user.userId,
        identityId: session.identityId,
        userPoolId: config.aws.cognito.userPoolId,
        region: config.aws.cognito.region,
        appClientId: config.aws.cognito.userPoolClientId,
      };
    } catch (error) {
      console.error("Error getting user details:", error);
      return null;
    }
  }

  /**
   * List all users in the user pool (admin function)
   */
  async listUsers(limit = 10) {
    try {
      const cognitoClient = await this.initializeCognitoClient();

      const params = {
        UserPoolId: config.aws.cognito.userPoolId,
        Limit: limit,
      };

      const data = await cognitoClient.listUsers(params);
      return data.Users;
    } catch (error) {
      console.error("Error listing users:", error);
      throw error;
    }
  }

  /**
   * Update user role (admin function)
   */
  async updateUserRole(username, role) {
    try {
      const cognitoClient = await this.initializeCognitoClient();

      const params = {
        UserPoolId: config.aws.cognito.userPoolId,
        Username: username,
        UserAttributes: [
          {
            Name: "custom:user_role",
            Value: role, // "admin" or "client"
          },
        ],
      };

      await cognitoClient.adminUpdateUserAttributes(params);
      console.log(`User ${username} role updated to ${role}`);
      return { success: true };
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  /**
   * Get user attribute value
   */
  getUserAttribute(user, attributeName) {
    if (!user || !user.Attributes) return "N/A";

    const attribute = user.Attributes.find(
      (attr) => attr.Name === attributeName
    );
    return attribute ? attribute.Value : "N/A";
  }

  /**
   * Get user role
   */
  async getUserRole(username = null) {
    try {
      if (!username) {
        const user = await this.getCurrentUser();
        username = user?.username;
      }

      if (!username) return null;

      const cognitoClient = await this.initializeCognitoClient();
      const params = {
        UserPoolId: config.aws.cognito.userPoolId,
        Username: username,
      };

      const userData = await cognitoClient.adminGetUser(params);
      return this.getUserAttribute(userData, "custom:user_role");
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  }

  /**
   * Check if current user is admin
   */
  async isAdmin() {
    try {
      const role = await this.getUserRole();
      return role === "admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  /**
   * Reset service state (useful for testing)
   */
  reset() {
    this.currentUser = null;
    this.session = null;
    this.cognitoClient = null;
  }
}

// Export singleton instance
const authService = new AuthService();

// React Context Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const isAuth = await authService.isAuthenticated();

        if (isAuth) {
          const userDetails = await authService.getUserDetails();
          setUser(userDetails);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const contextValue = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signOut: async () => {
      const result = await authService.signOut();
      if (result.success) {
        setUser(null);
      }
      return result;
    },
    refreshUser: async () => {
      try {
        const userDetails = await authService.getUserDetails();
        setUser(userDetails);
        return userDetails;
      } catch (err) {
        setError(err.message);
        return null;
      }
    },
    // Include service methods for direct access
    authService,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export default service for backward compatibility
export default authService;

// Named exports for convenience
export const {
  getSession,
  isAuthenticated,
  signOut,
  getUserDetails,
  listUsers,
  updateUserRole,
  getUserRole,
  isAdmin,
} = authService;
