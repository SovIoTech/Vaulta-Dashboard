/**
 * queries.js - Optimized query functions for CAN_BMS_Data_Optimized table
 *
 * This module provides functions for efficient querying of battery data using
 * the optimized table structure with time bucket indexes.
 */

// Table name
const TABLE_NAME = "CAN_BMS_Data_Optimized";

// Helper function to convert DynamoDB format to app format
const convertDynamoDBFormat = (item) => {
  if (!item) return item;

  // If the item is already in the correct format, return it
  if (!item.N && !item.S && !item.BOOL) {
    return item;
  }

  // Convert from DynamoDB format
  const converted = {};
  for (const [key, value] of Object.entries(item)) {
    if (value?.N !== undefined) {
      converted[key] = { N: value.N };
    } else if (value?.S !== undefined) {
      converted[key] = { S: value.S };
    } else if (value?.BOOL !== undefined) {
      converted[key] = { BOOL: value.BOOL };
    } else if (
      typeof value === "number" ||
      typeof value === "string" ||
      typeof value === "boolean"
    ) {
      // Already in simple format
      converted[key] = value;
    } else {
      converted[key] = value;
    }
  }
  return converted;
};

/**
 * Get the latest reading for a battery
 * @param {Object} docClient - DynamoDB DocumentClient instance
 * @param {String} batteryId - Battery ID (e.g., "BAT-0x440")
 * @returns {Promise<Object>} Latest battery reading
 */
export const getLatestReading = async (docClient, batteryId) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "TagID = :tid",
      ExpressionAttributeValues: {
        ":tid": batteryId,
      },
      Limit: 1,
      ScanIndexForward: false, // Descending order (newest first)
    };

    const result = await docClient.query(params).promise();

    if (result.Items.length > 0) {
      // Convert the data to the format expected by the dashboard
      const item = result.Items[0];
      const convertedItem = {};

      for (const [key, value] of Object.entries(item)) {
        // Convert numeric values to DynamoDB format expected by dashboard
        if (typeof value === "number") {
          convertedItem[key] = { N: value.toString() };
        } else if (typeof value === "string" && key !== "TagID") {
          // Check if it's a numeric string
          if (!isNaN(value)) {
            convertedItem[key] = { N: value };
          } else {
            convertedItem[key] = { S: value };
          }
        } else {
          convertedItem[key] = value;
        }
      }

      return convertedItem;
    }

    return null;
  } catch (error) {
    console.error(`Error getting latest reading for ${batteryId}:`, error);
    throw error;
  }
};

/**
 * Get the latest readings for all batteries
 * @param {Object} docClient - DynamoDB DocumentClient instance
 * @param {Number} limit - Maximum number of items to return (default: 10)
 * @returns {Promise<Array>} Latest readings across all batteries
 */
export const getLatestReadingsAll = async (docClient, limit = 10) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      IndexName: "LatestDataIndex",
      KeyConditionExpression: "LATEST = :latest",
      ExpressionAttributeValues: {
        ":latest": "LATEST",
      },
      Limit: limit,
      ScanIndexForward: false, // Descending order (newest first)
    };

    const result = await docClient.query(params).promise();
    return result.Items.map(convertDynamoDBFormat);
  } catch (error) {
    console.error("Error getting latest readings:", error);
    throw error;
  }
};

/**
 * Get data from the last minute for a specific battery
 * @param {Object} docClient - DynamoDB DocumentClient instance
 * @param {String} batteryId - Battery ID
 * @param {Array} attributes - Optional list of attributes to retrieve
 * @returns {Promise<Array>} Battery readings from the last minute
 */
export const getLastMinuteData = async (
  docClient,
  batteryId,
  attributes = null
) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const oneMinuteAgo = now - 60;

    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "TagID = :tid AND #ts > :time",
      ExpressionAttributeNames: {
        "#ts": "Timestamp",
      },
      ExpressionAttributeValues: {
        ":tid": batteryId,
        ":time": oneMinuteAgo,
      },
    };

    // Add projection expression if specific attributes are requested
    if (attributes && attributes.length > 0) {
      const attrNames = {};
      attributes.forEach((attr, index) => {
        if (attr !== "TagID" && attr !== "Timestamp") {
          attrNames[`#attr${index}`] = attr;
        }
      });

      // Only add expression attributes if we have custom attributes
      if (Object.keys(attrNames).length > 0) {
        params.ExpressionAttributeNames = {
          ...params.ExpressionAttributeNames,
          ...attrNames,
        };

        // Build projection expression
        const projectionItems = ["TagID", "#ts"];
        Object.keys(attrNames).forEach((key) => {
          projectionItems.push(key);
        });

        params.ProjectionExpression = projectionItems.join(", ");
      }
    }

    const result = await docClient.query(params).promise();

    // Convert to expected format
    return result.Items.map((item) => {
      const convertedItem = {};
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === "number") {
          convertedItem[key] = { N: value.toString() };
        } else if (typeof value === "string" && key !== "TagID") {
          if (!isNaN(value)) {
            convertedItem[key] = { N: value };
          } else {
            convertedItem[key] = { S: value };
          }
        } else {
          convertedItem[key] = value;
        }
      }
      return convertedItem;
    });
  } catch (error) {
    console.error(`Error getting last minute data for ${batteryId}:`, error);
    throw error;
  }
};

/**
 * Get battery anomalies from BatteryAnomalies_EC2 table
 * @param {Object} docClient - DynamoDB DocumentClient instance
 * @param {String} batteryId - Battery ID (e.g., "BAT-0x440")
 * @param {Number} limit - Maximum number of anomalies to return (default: 50)
 * @returns {Promise<Object>} Anomalies data with success status
 */
export const getBatteryAnomalies = async (docClient, batteryId, limit = 50) => {
  try {
    // First try to query using a GSI on tag_id (if it exists)
    const queryParams = {
      TableName: "BatteryAnomalies_EC2",
      IndexName: "tag_id-timestamp-index", // Assuming GSI exists
      KeyConditionExpression: "tag_id = :batteryId",
      ExpressionAttributeValues: {
        ":batteryId": batteryId,
      },
      ScanIndexForward: false, // Sort by timestamp descending (newest first)
      Limit: limit,
    };

    // Fallback scan parameters if GSI doesn't exist
    const scanParams = {
      TableName: "BatteryAnomalies_EC2",
      FilterExpression: "tag_id = :batteryId",
      ExpressionAttributeValues: {
        ":batteryId": batteryId,
      },
      Limit: limit,
    };

    let result;
    try {
      // Try query first (more efficient if GSI exists)
      result = await docClient.query(queryParams).promise();
    } catch (queryError) {
      console.log(
        "GSI query failed, falling back to scan:",
        queryError.message
      );
      // Fall back to scan if query fails
      result = await docClient.scan(scanParams).promise();
    }

    console.log(`Found ${result.Items.length} anomalies for ${batteryId}`);

    // Format the data for the frontend
    const formattedAnomalies = result.Items.map((item) => ({
      id: item.id,
      timestamp: parseInt(item.timestamp) * 1000, // Convert to milliseconds
      anomaly_score: parseFloat(item.anomaly_score),
      detection_time: item.detection_time,
      MaxCellTemp: parseFloat(item.MaxCellTemp),
      MaximumCellVoltage: parseFloat(item.MaximumCellVoltage),
      MinCellTemp: parseFloat(item.MinCellTemp),
      MinimumCellVoltage: parseFloat(item.MinimumCellVoltage),
      SOCAh: parseFloat(item.SOCAh),
      SOCPercent: parseFloat(item.SOCPercent),
      tag_id: item.tag_id,
      TotalBattVoltage: parseFloat(item.TotalBattVoltage),
      TotalCurrent: parseFloat(item.TotalCurrent),
    }));

    // Sort by timestamp (newest first)
    formattedAnomalies.sort((a, b) => b.timestamp - a.timestamp);

    return {
      success: true,
      data: formattedAnomalies,
      count: formattedAnomalies.length,
    };
  } catch (error) {
    console.error("Error fetching battery anomalies:", error);
    return {
      success: false,
      error: error.message,
      data: [],
      count: 0,
    };
  }
};

/**
 * Get all battery anomalies from BatteryAnomalies_EC2 table (no filtering)
 * @param {Object} docClient - DynamoDB DocumentClient instance
 * @param {Number} limit - Maximum number of anomalies to return (default: 50)
 * @returns {Promise<Object>} All anomalies data with success status
 */
export const getAllBatteryAnomalies = async (docClient, limit = 50) => {
  try {
    const scanParams = {
      TableName: "BatteryAnomalies_EC2",
      Limit: limit,
    };

    const result = await docClient.scan(scanParams).promise();

    console.log(`Found ${result.Items.length} total anomalies`);

    // Format the data for the frontend
    const formattedAnomalies = result.Items.map((item) => ({
      id: item.id,
      timestamp: parseInt(item.timestamp) * 1000, // Convert to milliseconds
      anomaly_score: parseFloat(item.anomaly_score),
      detection_time: item.detection_time,
      MaxCellTemp: parseFloat(item.MaxCellTemp),
      MaximumCellVoltage: parseFloat(item.MaximumCellVoltage),
      MinCellTemp: parseFloat(item.MinCellTemp),
      MinimumCellVoltage: parseFloat(item.MinimumCellVoltage),
      SOCAh: parseFloat(item.SOCAh),
      SOCPercent: parseFloat(item.SOCPercent),
      tag_id: item.tag_id,
      TotalBattVoltage: parseFloat(item.TotalBattVoltage),
      TotalCurrent: parseFloat(item.TotalCurrent),
    }));

    // Sort by timestamp (newest first)
    formattedAnomalies.sort((a, b) => b.timestamp - a.timestamp);

    return {
      success: true,
      data: formattedAnomalies,
      count: formattedAnomalies.length,
      lastEvaluatedKey: result.LastEvaluatedKey, // For pagination
    };
  } catch (error) {
    console.error("Error fetching all battery anomalies:", error);
    return {
      success: false,
      error: error.message,
      data: [],
      count: 0,
    };
  }
};

/**
 * Get all unique battery IDs from BatteryAnomalies_EC2 table
 * @param {Object} docClient - DynamoDB DocumentClient instance
 * @returns {Promise<Object>} Available battery IDs with success status
 */
export const getAvailableBatteryIds = async (docClient) => {
  try {
    const params = {
      TableName: "BatteryAnomalies_EC2",
      ProjectionExpression: "tag_id",
    };

    const result = await docClient.scan(params).promise();

    // Get unique battery IDs
    const uniqueIds = [...new Set(result.Items.map((item) => item.tag_id))];

    return {
      success: true,
      data: uniqueIds.sort(),
      count: uniqueIds.length,
    };
  } catch (error) {
    console.error("Error fetching available battery IDs:", error);
    return {
      success: false,
      error: error.message,
      data: [],
      count: 0,
    };
  }
};

/**
 * Get data from the last hour using hour bucket index
 * @param {Object} docClient - DynamoDB DocumentClient instance
 * @param {String} batteryId - Battery ID
 * @param {Array} attributes - Optional list of attributes to retrieve
 * @returns {Promise<Array>} Battery readings from the current hour
 */
export const getLastHourData = async (
  docClient,
  batteryId,
  attributes = null
) => {
  try {
    const date = new Date();
    const hourStr = `${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}${String(
      date.getHours()
    ).padStart(2, "0")}`;
    const hourBucket = `${batteryId}#HOUR_${hourStr}`;

    const params = {
      TableName: TABLE_NAME,
      IndexName: "HourlyBucketIndex",
      KeyConditionExpression: "TagID_TimeWindow_HOUR = :bucket",
      ExpressionAttributeValues: {
        ":bucket": hourBucket,
      },
    };

    // Add projection expression if needed
    if (attributes && attributes.length > 0) {
      const attrNames = {};
      attributes.forEach((attr, index) => {
        if (attr !== "TagID" && attr !== "Timestamp") {
          attrNames[`#attr${index}`] = attr;
        }
      });

      if (Object.keys(attrNames).length > 0) {
        params.ExpressionAttributeNames = {
          ...params.ExpressionAttributeNames,
          ...attrNames,
        };

        const projectionItems = ["TagID", "#ts"];
        Object.keys(attrNames).forEach((key) => {
          projectionItems.push(key);
        });

        params.ProjectionExpression = projectionItems.join(", ");
      }
    }

    const result = await docClient.query(params).promise();
    return result.Items.map(convertDynamoDBFormat);
  } catch (error) {
    console.error(`Error getting last hour data for ${batteryId}:`, error);
    throw error;
  }
};

/**
 * Get data from the current day using day bucket index
 * @param {Object} docClient - DynamoDB DocumentClient instance
 * @param {String} batteryId - Battery ID
 * @param {Array} attributes - Optional list of attributes to retrieve
 * @returns {Promise<Array>} Battery readings from the current day
 */
export const getLastDayData = async (
  docClient,
  batteryId,
  attributes = null
) => {
  try {
    const date = new Date();
    const dayStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(date.getDate()).padStart(2, "0")}`;
    const dayBucket = `${batteryId}#DAY_${dayStr}`;

    const params = {
      TableName: TABLE_NAME,
      IndexName: "DailyBucketIndex",
      KeyConditionExpression: "TagID_TimeWindow_DAY = :bucket",
      ExpressionAttributeValues: {
        ":bucket": dayBucket,
      },
    };

    // Add projection expression if needed
    if (attributes && attributes.length > 0) {
      const attrNames = {};
      attributes.forEach((attr, index) => {
        if (attr !== "TagID" && attr !== "Timestamp") {
          attrNames[`#attr${index}`] = attr;
        }
      });

      if (Object.keys(attrNames).length > 0) {
        params.ExpressionAttributeNames = {
          ...params.ExpressionAttributeNames,
          ...attrNames,
        };

        const projectionItems = ["TagID", "#ts"];
        Object.keys(attrNames).forEach((key) => {
          projectionItems.push(key);
        });

        params.ProjectionExpression = projectionItems.join(", ");
      }
    }

    const result = await docClient.query(params).promise();
    return result.Items.map(convertDynamoDBFormat);
  } catch (error) {
    console.error(`Error getting last day data for ${batteryId}:`, error);
    throw error;
  }
};

/**
 * Get data from the current month using month bucket index
 * @param {Object} docClient - DynamoDB DocumentClient instance
 * @param {String} batteryId - Battery ID
 * @param {Array} attributes - Optional list of attributes to retrieve
 * @returns {Promise<Array>} Battery readings from the current month
 */
export const getLastMonthData = async (
  docClient,
  batteryId,
  attributes = null
) => {
  try {
    const date = new Date();
    const monthStr = `${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthBucket = `${batteryId}#MONTH_${monthStr}`;

    const params = {
      TableName: TABLE_NAME,
      IndexName: "MonthlyBucketIndex",
      KeyConditionExpression: "TagID_TimeWindow_MONTH = :bucket",
      ExpressionAttributeValues: {
        ":bucket": monthBucket,
      },
    };

    // Add projection expression if needed
    if (attributes && attributes.length > 0) {
      const attrNames = {};
      attributes.forEach((attr, index) => {
        if (attr !== "TagID" && attr !== "Timestamp") {
          attrNames[`#attr${index}`] = attr;
        }
      });

      if (Object.keys(attrNames).length > 0) {
        params.ExpressionAttributeNames = {
          ...params.ExpressionAttributeNames,
          ...attrNames,
        };

        const projectionItems = ["TagID", "#ts"];
        Object.keys(attrNames).forEach((key) => {
          projectionItems.push(key);
        });

        params.ProjectionExpression = projectionItems.join(", ");
      }
    }

    const result = await docClient.query(params).promise();
    return result.Items.map(convertDynamoDBFormat);
  } catch (error) {
    console.error(`Error getting last month data for ${batteryId}:`, error);
    throw error;
  }
};

/**
 * Get data for a custom time range
 * @param {Object} docClient - DynamoDB DocumentClient instance
 * @param {String} batteryId - Battery ID
 * @param {Number} startTime - Start timestamp (Unix)
 * @param {Number} endTime - End timestamp (Unix)
 * @param {Array} attributes - Optional list of attributes to retrieve
 * @returns {Promise<Array>} Battery readings within the specified time range
 */
export const getTimeRangeData = async (
  docClient,
  batteryId,
  startTime,
  endTime,
  attributes = null
) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "TagID = :tid AND #ts BETWEEN :start AND :end",
      ExpressionAttributeNames: {
        "#ts": "Timestamp",
      },
      ExpressionAttributeValues: {
        ":tid": batteryId,
        ":start": startTime,
        ":end": endTime,
      },
    };

    // Add projection expression if needed
    if (attributes && attributes.length > 0) {
      const attrNames = {};
      attributes.forEach((attr, index) => {
        if (attr !== "TagID" && attr !== "Timestamp") {
          attrNames[`#attr${index}`] = attr;
        }
      });

      if (Object.keys(attrNames).length > 0) {
        params.ExpressionAttributeNames = {
          ...params.ExpressionAttributeNames,
          ...attrNames,
        };

        const projectionItems = ["TagID", "#ts"];
        Object.keys(attrNames).forEach((key) => {
          projectionItems.push(key);
        });

        params.ProjectionExpression = projectionItems.join(", ");
      }
    }

    const result = await docClient.query(params).promise();
    return result.Items.map(convertDynamoDBFormat);
  } catch (error) {
    console.error(`Error getting time range data for ${batteryId}:`, error);
    throw error;
  }
};

/**
 * Get the last 7 days of data using multiple day bucket queries in parallel
 * @param {Object} docClient - DynamoDB DocumentClient instance
 * @param {String} batteryId - Battery ID
 * @param {Array} attributes - Optional list of attributes to retrieve
 * @returns {Promise<Array>} Battery readings from the last 7 days
 */
export const getLast7DaysData = async (
  docClient,
  batteryId,
  attributes = null
) => {
  try {
    // Generate buckets for the last 7 days
    const dayBuckets = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = `${date.getFullYear()}${String(
        date.getMonth() + 1
      ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
      dayBuckets.push(`${batteryId}#DAY_${dayStr}`);
    }

    // Query each day bucket in parallel
    const queryPromises = dayBuckets.map((bucket) => {
      const params = {
        TableName: TABLE_NAME,
        IndexName: "DailyBucketIndex",
        KeyConditionExpression: "TagID_TimeWindow_DAY = :bucket",
        ExpressionAttributeValues: {
          ":bucket": bucket,
        },
      };

      // Add projection expression if needed
      if (attributes && attributes.length > 0) {
        const attrNames = {};
        attributes.forEach((attr, index) => {
          if (attr !== "TagID" && attr !== "Timestamp") {
            attrNames[`#attr${index}`] = attr;
          }
        });

        if (Object.keys(attrNames).length > 0) {
          params.ExpressionAttributeNames = {
            ...params.ExpressionAttributeNames,
            ...attrNames,
          };

          const projectionItems = ["TagID", "#ts"];
          Object.keys(attrNames).forEach((key) => {
            projectionItems.push(key);
          });

          params.ProjectionExpression = projectionItems.join(", ");
        }
      }

      return docClient.query(params).promise();
    });

    // Wait for all queries to complete
    const results = await Promise.all(queryPromises);

    // Combine results from all days and convert format
    const allItems = results.flatMap((result) => result.Items || []);
    return allItems.map(convertDynamoDBFormat);
  } catch (error) {
    console.error(`Error getting last 7 days data for ${batteryId}:`, error);
    throw error;
  }
};

// Export a function to add pagination support to any query
export const paginateQuery = async (
  docClient,
  queryFn,
  params,
  allItems = []
) => {
  try {
    const result = await queryFn(params).promise();

    // Add items from this page
    if (result.Items && result.Items.length > 0) {
      allItems = [...allItems, ...result.Items];
    }

    // If there are more items to fetch
    if (result.LastEvaluatedKey) {
      // Update params with the last evaluated key
      params.ExclusiveStartKey = result.LastEvaluatedKey;

      // Recursive call to fetch next page
      return paginateQuery(docClient, queryFn, params, allItems);
    }

    return allItems;
  } catch (error) {
    console.error("Error during paginated query:", error);
    throw error;
  }
};

// Legacy function names for backward compatibility
export const getLastInsertedData = async (docClient, tableName, tagID) => {
  return getLatestReading(docClient, tagID);
};

export const getDataByTagAndTimestamp = async (
  docClient,
  tableName,
  tagID,
  startTime,
  endTime
) => {
  return getTimeRangeData(docClient, tagID, startTime, endTime);
};

export const getDataByTimestamp = async (
  docClient,
  tableName,
  tagID,
  timestamp
) => {
  return getTimeRangeData(docClient, tagID, timestamp, timestamp);
};

/**
 * Get the minimal essential fields for the latest battery reading
 * @param {Object} docClient - DynamoDB DocumentClient instance
 * @param {String} batteryId - Battery ID (e.g., "BAT-0x440")
 * @returns {Promise<Object>} Latest battery reading with only essential fields
 */
export const getLatestReadingMinimal = async (docClient, batteryId) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "TagID = :tid",
      ExpressionAttributeValues: {
        ":tid": batteryId,
      },
      ProjectionExpression: "TagID, #ts, Events, DeviceId",
      ExpressionAttributeNames: {
        "#ts": "Timestamp", // Using alias since 'Timestamp' is a reserved word
      },
      Limit: 1,
      ScanIndexForward: false, // Descending order (newest first)
    };

    const result = await docClient.query(params).promise();

    if (result.Items.length > 0) {
      const item = result.Items[0];

      // Convert to the expected format with DynamoDB attribute types
      return {
        TagID: item.TagID,
        Timestamp: { N: item.Timestamp.toString() },
        Events: { N: item.Events.toString() },
        DeviceId: { N: item.DeviceId.toString() },
      };
    }

    return null;
  } catch (error) {
    console.error(
      `Error getting minimal latest reading for ${batteryId}:`,
      error
    );
    throw error;
  }
};
