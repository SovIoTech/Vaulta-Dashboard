// src/services/data.service.js
import AWS from "aws-sdk";
import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "./auth.service.js";
import config from "../config/index.js";
import { calculateTimeRange, safeNumberConversion } from "../utils/helpers.js";

class DataService {
  constructor() {
    this.dynamoDB = null;
    this.initialized = false;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Initialize DynamoDB client
   */
  async initialize() {
    if (this.initialized && this.dynamoDB) return this.dynamoDB;

    try {
      const session = await authService.getSession();

      this.dynamoDB = new AWS.DynamoDB({
        apiVersion: "2012-08-10",
        region: config.aws.region,
        credentials: session.credentials,
      });

      this.initialized = true;
      return this.dynamoDB;
    } catch (error) {
      console.error("Error initializing DynamoDB:", error);
      throw new Error(
        `Failed to initialize database connection: ${error.message}`
      );
    }
  }

  /**
   * Get from cache if available and not expired
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Execute paginated DynamoDB query
   */
  async executePaginatedQuery(params) {
    await this.initialize();

    let allItems = [];
    let lastEvaluatedKey = null;
    let pageCount = 0;

    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const result = await this.dynamoDB.query(params).promise();
      allItems = allItems.concat(result.Items);
      lastEvaluatedKey = result.LastEvaluatedKey;
      pageCount++;

      // Prevent infinite loops
      if (pageCount > 100) {
        throw new Error(
          "Query exceeded maximum pages limit (100). Please refine your query."
        );
      }
    } while (lastEvaluatedKey);

    return allItems;
  }

  /**
   * Get last minute data for a tag
   */
  async getLastMinuteData(tagID) {
    const cacheKey = `lastMinute_${tagID}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      await this.initialize();

      const now = Math.floor(Date.now() / 1000);
      const lastMinute = now - 60;

      const params = {
        TableName: config.api.dynamodb.tableName,
        KeyConditionExpression: "#tagID = :tagID and #timestamp >= :lastMinute",
        ExpressionAttributeNames: {
          "#tagID": "TagID",
          "#timestamp": "Timestamp",
        },
        ExpressionAttributeValues: {
          ":tagID": { S: tagID },
          ":lastMinute": { N: lastMinute.toString() },
        },
        ScanIndexForward: false,
        Limit: 1,
      };

      const data = await this.dynamoDB.query(params).promise();
      const result = data.Items || [];

      if (result.length === 0) {
        throw new Error(
          `No data found for device ${tagID} in the last minute. Device may be offline or not transmitting data.`
        );
      }

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error fetching last minute data:", error);
      throw new Error(
        `Failed to fetch latest data for ${tagID}: ${error.message}`
      );
    }
  }

  /**
   * Get data by tag and timestamp range
   */
  async getDataByTagAndTimestamp(tagID, startTime, endTime) {
    const cacheKey = `range_${tagID}_${startTime}_${endTime}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params = {
        TableName: config.api.dynamodb.tableName,
        KeyConditionExpression:
          "#tagID = :tagID and #timestamp BETWEEN :startTime AND :endTime",
        ExpressionAttributeNames: {
          "#tagID": "TagID",
          "#timestamp": "Timestamp",
        },
        ExpressionAttributeValues: {
          ":tagID": { S: tagID },
          ":startTime": { N: startTime.toString() },
          ":endTime": { N: endTime.toString() },
        },
        ScanIndexForward: true,
      };

      const result = await this.executePaginatedQuery(params);

      if (result.length === 0) {
        throw new Error(
          `No data found for device ${tagID} in the specified time range. Check device connectivity and time range.`
        );
      }

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error fetching data by tag and timestamp:", error);
      throw new Error(`Failed to fetch data for ${tagID}: ${error.message}`);
    }
  }

  /**
   * Get data by time range string (e.g., '1day', '1week')
   */
  async getDataByTimeRange(tagID, timeRange) {
    try {
      const { startTime, endTime } = calculateTimeRange(timeRange);
      return await this.getDataByTagAndTimestamp(tagID, startTime, endTime);
    } catch (error) {
      throw new Error(
        `Failed to fetch data for time range ${timeRange}: ${error.message}`
      );
    }
  }

  /**
   * Get most recent data point
   */
  async getLatestData(tagID) {
    const cacheKey = `latest_${tagID}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      await this.initialize();

      const params = {
        TableName: config.api.dynamodb.tableName,
        KeyConditionExpression: "#tagID = :tagID",
        ExpressionAttributeNames: {
          "#tagID": "TagID",
        },
        ExpressionAttributeValues: {
          ":tagID": { S: tagID },
        },
        ScanIndexForward: false,
        Limit: 1,
      };

      const data = await this.dynamoDB.query(params).promise();
      const result = data.Items || [];

      if (result.length === 0) {
        throw new Error(
          `No data found for device ${tagID}. Device may not exist or has never transmitted data.`
        );
      }

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error fetching latest data:", error);
      throw new Error(
        `Failed to fetch latest data for ${tagID}: ${error.message}`
      );
    }
  }

  /**
   * Process and structure BMS data
   */
  processRawData(items) {
    if (!items || items.length === 0) return null;

    const processedItems = items.map((item) => {
      const processed = {};

      // Convert DynamoDB format to regular object
      for (const [key, value] of Object.entries(item)) {
        if (value.N) {
          processed[key] = safeNumberConversion(value.N);
        } else if (value.S) {
          processed[key] = value.S;
        } else if (value.BOOL !== undefined) {
          processed[key] = value.BOOL;
        } else {
          processed[key] = value;
        }
      }

      return processed;
    });

    return processedItems;
  }

  /**
   * Get structured BMS data for dashboard
   */
  async getBMSData(tagID = config.app.defaultTagId) {
    try {
      const rawData = await this.getLastMinuteData(tagID);
      const processed = this.processRawData(rawData);

      if (!processed || processed.length === 0) {
        throw new Error(`No valid data could be processed for device ${tagID}`);
      }

      return {
        lastMinuteData: processed,
        userDetails: await authService.getUserDetails(),
        timestamp: Date.now(),
        success: true,
      };
    } catch (error) {
      console.error("Error getting BMS data:", error);
      // Return error state instead of fallback data
      return {
        lastMinuteData: null,
        userDetails: await authService.getUserDetails(),
        timestamp: Date.now(),
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get node data for tables
   */
  getNodeData(bmsState) {
    if (!bmsState) {
      throw new Error("No BMS data available to generate node data");
    }

    const roundValue = (value) => parseFloat(value || 0).toFixed(2);

    return [
      {
        node: "Node 00",
        data: {
          balanceStatus: roundValue(bmsState.Node00BalanceStatus?.N || "0"),
          totalVoltage: roundValue(bmsState.Node00TotalVoltage?.N || "0"),
          cellVoltages: Array.from({ length: 14 }, (_, i) =>
            roundValue(bmsState[`Node00Cell${i < 10 ? `0${i}` : i}`]?.N || "0")
          ),
          temperatures: Array.from({ length: 6 }, (_, i) =>
            roundValue(bmsState[`Node00Temp${i < 10 ? `0${i}` : i}`]?.N || "0")
          ),
          tempCount: roundValue(bmsState.Node00TempCount?.N || "0"),
        },
      },
      {
        node: "Node 01",
        data: {
          balanceStatus: roundValue(bmsState.Node01BalanceStatus?.N || "0"),
          totalVoltage: roundValue(bmsState.Node01TotalVoltage?.N || "0"),
          cellVoltages: Array.from({ length: 14 }, (_, i) =>
            roundValue(bmsState[`Node01Cell${i < 10 ? `0${i}` : i}`]?.N || "0")
          ),
          temperatures: Array.from({ length: 6 }, (_, i) =>
            roundValue(bmsState[`Node01Temp${i < 10 ? `0${i}` : i}`]?.N || "0")
          ),
          tempCount: roundValue(bmsState.Node01TempCount?.N || "0"),
        },
      },
    ];
  }

  /**
   * Reset service state
   */
  reset() {
    this.dynamoDB = null;
    this.initialized = false;
    this.clearCache();
  }
}

// Export singleton instance
const dataService = new DataService();

// React Context and Provider
const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [bmsData, setBmsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Auto-refresh interval (in milliseconds)
  const REFRESH_INTERVAL = 30000; // 30 seconds

  useEffect(() => {
    // Only fetch data if we have authentication
    fetchBMSData();

    // Set up auto-refresh
    const interval = setInterval(fetchBMSData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const fetchBMSData = async (tagID = null) => {
    try {
      setLoading(true);
      setError(null);

      const data = await dataService.getBMSData(tagID);
      setBmsData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching BMS data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataByTimeRange = async (tagID, timeRange) => {
    try {
      setLoading(true);
      setError(null);

      const data = await dataService.getDataByTimeRange(tagID, timeRange);
      return data;
    } catch (error) {
      console.error("Error fetching time range data:", error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestData = async (tagID) => {
    try {
      setLoading(true);
      setError(null);

      const data = await dataService.getLatestData(tagID);
      return data;
    } catch (error) {
      console.error("Error fetching latest data:", error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getNodeData = () => {
    if (!bmsData?.lastMinuteData?.[0]) return null;

    try {
      return dataService.getNodeData(bmsData.lastMinuteData[0]);
    } catch (error) {
      console.error("Error processing node data:", error);
      setError(error.message);
      return null;
    }
  };

  const clearCache = () => {
    dataService.clearCache();
  };

  const refreshData = () => {
    fetchBMSData();
  };

  const value = {
    bmsData,
    loading,
    error,
    lastUpdated,

    // Methods
    fetchBMSData,
    fetchDataByTimeRange,
    fetchLatestData,
    getNodeData,
    clearCache,
    refreshData,

    // Expose the service for advanced usage
    dataService,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default dataService;

// Named exports for convenience
export const {
  getLastMinuteData,
  getDataByTagAndTimestamp,
  getDataByTimeRange,
  getLatestData,
  getBMSData,
  getNodeData,
  processRawData,
  clearCache,
} = dataService;
