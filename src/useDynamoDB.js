import { useState, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import AWS from "aws-sdk";
import awsconfig from "./aws-exports.js";

// Constants
const TABLE_NAME = "CAN_BMS_Data_Optimized"; // Updated to the new table name
const DEFAULT_BATTERY_IDS = ["BAT-0x440", "BAT-4501"]; // The two main battery IDs

/**
 * Custom hook for interacting with DynamoDB using the optimized table structure
 * @param {Array} batteryIds - Array of battery IDs to fetch data for (optional)
 * @param {Number} refreshInterval - Auto-refresh interval in milliseconds (optional)
 * @returns {Object} - DynamoDB data and state
 */
const useDynamoDB = (
  batteryIds = DEFAULT_BATTERY_IDS,
  refreshInterval = null
) => {
  const [tableMetadata, setTableMetadata] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dynamoDBClient, setDynamoDBClient] = useState(null);
  const [documentClient, setDocumentClient] = useState(null);

  // Initialize AWS clients
  useEffect(() => {
    const initializeClients = async () => {
      try {
        const session = await fetchAuthSession();
        const credentials = session.credentials;

        // Standard DynamoDB client for table operations
        const dynamoDB = new AWS.DynamoDB({
          apiVersion: "2012-08-10",
          region: awsconfig.region,
          credentials,
        });

        // DocumentClient for easier query operations
        const docClient = new AWS.DynamoDB.DocumentClient({
          apiVersion: "2012-08-10",
          region: awsconfig.region,
          credentials,
        });

        setDynamoDBClient(dynamoDB);
        setDocumentClient(docClient);
        fetchUserDetails(session);
      } catch (error) {
        console.error("Error initializing AWS clients:", error);
        setErrorMessage("Failed to initialize AWS clients.");
      }
    };

    initializeClients();
  }, []);

  // Fetch data when clients are initialized
  useEffect(() => {
    if (documentClient) {
      fetchData();
    }
  }, [documentClient]);

  // Set up auto-refresh if interval is provided
  useEffect(() => {
    if (!refreshInterval || !documentClient) return;

    const intervalId = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, documentClient]);

  // Fetch user details from session
  const fetchUserDetails = (session) => {
    try {
      const user = session?.identityId || null;
      if (user) {
        setUserDetails({
          userPoolId: awsconfig.userPoolId,
          region: awsconfig.region,
          appClientId: awsconfig.clientID,
          identityId: user,
        });
      } else {
        setUserDetails(null);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUserDetails(null);
    }
  };

  // Fetch table metadata (optional)
  const fetchTableMetadata = async () => {
    if (!dynamoDBClient) return;

    try {
      const params = { TableName: TABLE_NAME };
      const result = await dynamoDBClient.describeTable(params).promise();
      setTableMetadata(result.Table);
    } catch (error) {
      console.error("Error fetching table metadata:", error);
      setErrorMessage("Failed to fetch table metadata.");
    }
  };

  // Main data fetching function
  const fetchData = async () => {
    if (!documentClient) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      // Fetch data for each battery ID
      const batteryData = {};
      
      // Run queries in parallel for better performance
      const promises = batteryIds.map(batteryId => {
        return Promise.all([
          getLatestReading(batteryId),
          getLastMinuteData(batteryId),
          getLastHourData(batteryId),
          getLastDayData(batteryId)
        ]).then(([latest, lastMinute, lastHour, lastDay]) => {
          batteryData[batteryId] = {
            latest,
            lastMinute,
            lastHour,
            lastDay
          };
        });
      });

      await Promise.all(promises);
      setData(batteryData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  // Get latest reading for a battery
  const getLatestReading = async (batteryId) => {
    try {
      const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "TagID = :tid",
        ExpressionAttributeValues: {
          ":tid": batteryId
        },
        Limit: 1,
        ScanIndexForward: false // Descending order (newest first)
      };
      
      const result = await documentClient.query(params).promise();
      return result.Items.length > 0 ? result.Items[0] : null;
    } catch (error) {
      console.error(`Error getting latest reading for ${batteryId}:`, error);
      throw error;
    }
  };

  // Get last minute data using direct timestamp query
  const getLastMinuteData = async (batteryId) => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const oneMinuteAgo = now - 60;
      
      const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "TagID = :tid AND #ts > :time",
        ExpressionAttributeNames: {
          "#ts": "Timestamp"
        },
        ExpressionAttributeValues: {
          ":tid": batteryId,
          ":time": oneMinuteAgo
        }
      };
      
      const result = await documentClient.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error(`Error getting last minute data for ${batteryId}:`, error);
      throw error;
    }
  };

  // Get last hour data using hour bucket
  const getLastHourData = async (batteryId) => {
    try {
      const now = new Date();
      const hourStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}`;
      const hourBucket = `${batteryId}#HOUR_${hourStr}`;
      
      const params = {
        TableName: TABLE_NAME,
        IndexName: "HourlyBucketIndex",
        KeyConditionExpression: "TagID_TimeWindow_HOUR = :bucket",
        ExpressionAttributeValues: {
          ":bucket": hourBucket
        }
      };
      
      const result = await documentClient.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error(`Error getting last hour data for ${batteryId}:`, error);
      throw error;
    }
  };

  // Get last day data using day bucket
  const getLastDayData = async (batteryId) => {
    try {
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const dayBucket = `${batteryId}#DAY_${dateStr}`;
      
      const params = {
        TableName: TABLE_NAME,
        IndexName: "DailyBucketIndex",
        KeyConditionExpression: "TagID_TimeWindow_DAY = :bucket",
        ExpressionAttributeValues: {
          ":bucket": dayBucket
        }
      };
      
      const result = await documentClient.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error(`Error getting last day data for ${batteryId}:`, error);
      throw error;
    }
  };

  // Get specific time range data
  const getTimeRangeData = async (batteryId, startTime, endTime) => {
    try {
      const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "TagID = :tid AND #ts BETWEEN :start AND :end",
        ExpressionAttributeNames: {
          "#ts": "Timestamp"
        },
        ExpressionAttributeValues: {
          ":tid": batteryId,
          ":start": startTime,
          ":end": endTime
        }
      };
      
      const result = await documentClient.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error(`Error getting time range data for ${batteryId}:`, error);
      throw error;
    }
  };

  // Get last month data using month bucket
  const getLastMonthData = async (batteryId) => {
    try {
      const now = new Date();
      const monthStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthBucket = `${batteryId}#MONTH_${monthStr}`;
      
      const params = {
        TableName: TABLE_NAME,
        IndexName: "MonthlyBucketIndex",
        KeyConditionExpression: "TagID_TimeWindow_MONTH = :bucket",
        ExpressionAttributeValues: {
          ":bucket": monthBucket
        }
      };
      
      const result = await documentClient.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error(`Error getting last month data for ${batteryId}:`, error);
      throw error;
    }
  };

  // Manually trigger a data refresh
  const refreshData = () => {
    if (documentClient) {
      fetchData();
    }
  };

  return {
    tableMetadata,
    errorMessage,
    userDetails,
    data,
    loading,
    refreshData,
    // Export individual query functions for direct use
    getLatestReading,
    getLastMinuteData,
    getLastHourData,
    getLastDayData,
    getLastMonthData,
    getTimeRangeData
  };
};

export default useDynamoDB;