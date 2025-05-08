import AWS from "aws-sdk";
import { fetchAuthSession } from "aws-amplify/auth";
import awsconfig from "../../aws-exports.js";

// Constants
const TABLE_NAME = "CAN_BMS_Data_Optimized";

// Function to calculate start and end timestamps based on the selected time range
const calculateTimeRange = (timeRange) => {
  const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  switch (timeRange) {
    case "1min":
      return { startTime: now - 60, endTime: now };
    case "5min":
      return { startTime: now - 300, endTime: now };
    case "1hour":
      return { startTime: now - 3600, endTime: now };
    case "8hours":
      return { startTime: now - 28800, endTime: now };
    case "1day":
      return { startTime: now - 86400, endTime: now };
    case "7days":
      return { startTime: now - 604800, endTime: now };
    case "1month":
      return { startTime: now - 2592000, endTime: now };
    default:
      return { startTime: now - 60, endTime: now };
  }
};

// Helper function to round a value to 2 decimal places
const roundToTwoDecimals = (value) => {
  if (typeof value === "number") {
    return parseFloat(value.toFixed(2));
  }
  return value;
};

// Function to get the appropriate query method based on time range
const getQueryMethodForTimeRange = (docClient, timeRange, batteryId) => {
  // Get current date components
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  
  // Build bucket identifiers
  const hourBucket = `${batteryId}#HOUR_${year}${month}${day}${hour}`;
  const dayBucket = `${batteryId}#DAY_${year}${month}${day}`;
  const monthBucket = `${batteryId}#MONTH_${year}${month}`;
  
  // Use the most efficient query method based on time range
  switch (timeRange) {
    case "1min":
    case "5min":
      // For short ranges, use direct timestamp query
      return async () => {
        const { startTime, endTime } = calculateTimeRange(timeRange);
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
        return docClient.query(params).promise();
      };
      
    case "1hour":
      // Use hour bucket for hourly queries
      return async () => {
        const params = {
          TableName: TABLE_NAME,
          IndexName: "HourlyBucketIndex",
          KeyConditionExpression: "TagID_TimeWindow_HOUR = :bucket",
          ExpressionAttributeValues: {
            ":bucket": hourBucket
          }
        };
        return docClient.query(params).promise();
      };
      
    case "1day":
      // Use day bucket for daily queries
      return async () => {
        const params = {
          TableName: TABLE_NAME,
          IndexName: "DailyBucketIndex",
          KeyConditionExpression: "TagID_TimeWindow_DAY = :bucket",
          ExpressionAttributeValues: {
            ":bucket": dayBucket
          }
        };
        return docClient.query(params).promise();
      };
      
    case "7days":
      // Use multiple day bucket queries for week data
      return async () => {
        // Generate buckets for the last 7 days
        const dayBuckets = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
          dayBuckets.push(`${batteryId}#DAY_${dateStr}`);
        }
        
        // Run parallel queries for each day bucket
        const promises = dayBuckets.map(bucket => {
          const params = {
            TableName: TABLE_NAME,
            IndexName: "DailyBucketIndex",
            KeyConditionExpression: "TagID_TimeWindow_DAY = :bucket",
            ExpressionAttributeValues: {
              ":bucket": bucket
            }
          };
          return docClient.query(params).promise();
        });
        
        // Combine results
        const results = await Promise.all(promises);
        const items = results.flatMap(result => result.Items || []);
        return { Items: items };
      };
      
    case "1month":
      // Use month bucket for monthly queries
      return async () => {
        const params = {
          TableName: TABLE_NAME,
          IndexName: "MonthlyBucketIndex",
          KeyConditionExpression: "TagID_TimeWindow_MONTH = :bucket",
          ExpressionAttributeValues: {
            ":bucket": monthBucket
          }
        };
        return docClient.query(params).promise();
      };
      
    default:
      // Fallback to direct query using timestamps
      return async () => {
        const { startTime, endTime } = calculateTimeRange(timeRange);
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
        return docClient.query(params).promise();
      };
  }
};

// Function to fetch and structure data
export const fetchData = async (selectedTagId, selectedTimeRange) => {
  try {
    const session = await fetchAuthSession();
    const credentials = session.credentials;

    // Create DynamoDB DocumentClient for easier attribute handling
    const docClient = new AWS.DynamoDB.DocumentClient({
      apiVersion: "2012-08-10",
      region: awsconfig.region,
      credentials,
    });

    const batteryId = `BAT-${selectedTagId}`;
    
    // Get the appropriate query function based on time range
    const queryFn = getQueryMethodForTimeRange(docClient, selectedTimeRange, batteryId);
    
    // Execute the query
    const result = await queryFn();
    const fetchedData = result.Items || [];

    // Log the raw fetched data
    console.log(`Fetched ${fetchedData.length} items for ${batteryId} over ${selectedTimeRange}`);

    // Initialize structured data for Node0, Node1, Pack, Cell, Temperature, and SOC
    const structuredData = {
      Node0: {
        voltage: {
          cellVoltages: Array.from({ length: 14 }, () => []), // Array of arrays for each cell voltage
        },
        temperature: {}, // Object to hold temperature arrays for each sensor
      },
      Node1: {
        voltage: {
          cellVoltages: Array.from({ length: 14 }, () => []), // Array of arrays for each cell voltage
        },
        temperature: {}, // Object to hold temperature arrays for each sensor
      },
      Pack: {
        numParallelNodes: null,
        numNodes: null,
        thresholdOverCurrent: null,
        modes: null,
        totalBattVoltage: null,
        totalLoadVoltage: null,
        totalCurrent: null,
        serialNumber: null,
        state: null,
        events: null,
      },
      Cell: {
        maxCellVoltage: null,
        minCellVoltage: null,
        maxCellVoltageCellNo: null,
        minCellVoltageCellNo: null,
        maxCellVoltageNode: null,
        minCellVoltageNode: null,
        thresholdOverVoltage: null,
        thresholdUnderVoltage: null,
        criticalOverVoltThreshold: null,
        criticalUnderVoltThreshold: null,
        balanceThresholdVoltage: null,
      },
      Temperature: {
        maxCellTemp: null,
        minCellTemp: null,
        maxCellTempNode: null,
        minCellTempNode: null,
        thresholdOverTemp: null,
        thresholdUnderTemp: null,
      },
      SOC: {
        socPercent: null,
        socAh: null,
        balanceSOCPercent: null,
        balanceSOCAh: null,
      },
    };

    // Iterate through all fetched data objects
    fetchedData.forEach((item) => {
      // Process Node0 data
      for (let i = 0; i < 14; i++) {
        const cellKey = `Node00Cell${i < 10 ? `0${i}` : i}`;
        if (item[cellKey] !== undefined) {
          const value = typeof item[cellKey] === 'object' && item[cellKey].N 
            ? parseFloat(item[cellKey].N) 
            : item[cellKey];
          
          structuredData.Node0.voltage.cellVoltages[i].push(
            roundToTwoDecimals(parseFloat(value)) // Round to 2 decimal places
          );
        }
      }

      // Process Node0 temperature keys (e.g., Node00Temp00, Node00Temp01, etc.)
      for (let i = 0; i < 6; i++) {
        const tempKey = `Node00Temp${i < 10 ? `0${i}` : i}`;
        if (item[tempKey] !== undefined) {
          const value = typeof item[tempKey] === 'object' && item[tempKey].N 
            ? parseFloat(item[tempKey].N) 
            : item[tempKey];
          
          // Initialize the array for this temperature sensor if it doesn't exist
          if (!structuredData.Node0.temperature[tempKey]) {
            structuredData.Node0.temperature[tempKey] = [];
          }
          // Append the temperature value to the respective sensor array
          structuredData.Node0.temperature[tempKey].push(
            roundToTwoDecimals(parseFloat(value)) // Round to 2 decimal places
          );
        }
      }

      // Process Node1 data
      for (let i = 0; i < 14; i++) {
        const cellKey = `Node01Cell${i < 10 ? `0${i}` : i}`;
        if (item[cellKey] !== undefined) {
          const value = typeof item[cellKey] === 'object' && item[cellKey].N 
            ? parseFloat(item[cellKey].N) 
            : item[cellKey];
          
          structuredData.Node1.voltage.cellVoltages[i].push(
            roundToTwoDecimals(parseFloat(value)) // Round to 2 decimal places
          );
        }
      }

      // Process Node1 temperature keys (e.g., Node01Temp00, Node01Temp01, etc.)
      for (let i = 0; i < 6; i++) {
        const tempKey = `Node01Temp${i < 10 ? `0${i}` : i}`;
        if (item[tempKey] !== undefined) {
          const value = typeof item[tempKey] === 'object' && item[tempKey].N 
            ? parseFloat(item[tempKey].N) 
            : item[tempKey];
          
          // Initialize the array for this temperature sensor if it doesn't exist
          if (!structuredData.Node1.temperature[tempKey]) {
            structuredData.Node1.temperature[tempKey] = [];
          }
          // Append the temperature value to the respective sensor array
          structuredData.Node1.temperature[tempKey].push(
            roundToTwoDecimals(parseFloat(value)) // Round to 2 decimal places
          );
        }
      }

      // Helper function to extract value (handling both DynamoDB attribute format and DocumentClient format)
      const getValue = (obj, key) => {
        if (!obj) return null;
        if (obj[key] === undefined) return null;
        
        // Handle DynamoDB attribute format
        if (typeof obj[key] === 'object' && obj[key].N) {
          return parseFloat(obj[key].N);
        }
        if (typeof obj[key] === 'object' && obj[key].S) {
          return obj[key].S;
        }
        
        // Handle DocumentClient format (already converted)
        return obj[key];
      };

      // Process Pack-Level Data
      structuredData.Pack = {
        numParallelNodes: getValue(item, 'PackNumParallelNodes'),
        numNodes: getValue(item, 'PackNumNodes'),
        thresholdOverCurrent: roundToTwoDecimals(getValue(item, 'PackThresholdOverCurrent')),
        modes: getValue(item, 'PackModes'),
        totalBattVoltage: roundToTwoDecimals(getValue(item, 'TotalBattVoltage')),
        totalLoadVoltage: roundToTwoDecimals(getValue(item, 'TotalLoadVoltage')),
        totalCurrent: roundToTwoDecimals(getValue(item, 'TotalCurrent')),
        serialNumber: getValue(item, 'SerialNumber'),
        state: getValue(item, 'State'),
        events: getValue(item, 'Events'),
      };

      // Process Cell-Level Data
      structuredData.Cell = {
        maxCellVoltage: roundToTwoDecimals(getValue(item, 'MaximumCellVoltage')),
        minCellVoltage: roundToTwoDecimals(getValue(item, 'MinimumCellVoltage')),
        maxCellVoltageCellNo: getValue(item, 'MaximumCellVoltageCellNo'),
        minCellVoltageCellNo: getValue(item, 'MinimumCellVoltageCellNo'),
        maxCellVoltageNode: getValue(item, 'MaximumCellVoltageNode'),
        minCellVoltageNode: getValue(item, 'MinimumCellVoltageNode'),
        thresholdOverVoltage: roundToTwoDecimals(getValue(item, 'CellThresholdOverVoltage')),
        thresholdUnderVoltage: roundToTwoDecimals(getValue(item, 'CellThresholdUnderVoltage')),
        criticalOverVoltThreshold: roundToTwoDecimals(getValue(item, 'CellCriticalOverVoltThreshold')),
        criticalUnderVoltThreshold: roundToTwoDecimals(getValue(item, 'CellCriticalUnderVoltThreshold')),
        balanceThresholdVoltage: roundToTwoDecimals(getValue(item, 'CellBalanceThresholdVoltage')),
      };

      // Process Temperature Data
      structuredData.Temperature = {
        maxCellTemp: roundToTwoDecimals(getValue(item, 'MaxCellTemp')),
        minCellTemp: roundToTwoDecimals(getValue(item, 'MinCellTemp')),
        maxCellTempNode: getValue(item, 'MaxCellTempNode'),
        minCellTempNode: getValue(item, 'MinCellTempNode'),
        thresholdOverTemp: roundToTwoDecimals(getValue(item, 'TempThresholdOverTemp')),
        thresholdUnderTemp: roundToTwoDecimals(getValue(item, 'TempThresholdUnderTemp')),
      };

      // Process SOC Data
      structuredData.SOC = {
        socPercent: roundToTwoDecimals(getValue(item, 'SOCPercent')),
        socAh: roundToTwoDecimals(getValue(item, 'SOCAh')),
        balanceSOCPercent: roundToTwoDecimals(getValue(item, 'BalanceSOCPercent')),
        balanceSOCAh: roundToTwoDecimals(getValue(item, 'BalanceSOCAh')),
      };
    });

    // Log structured data summary
    console.log(`Structured ${fetchedData.length} items into organized data structure`);

    return structuredData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};