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
