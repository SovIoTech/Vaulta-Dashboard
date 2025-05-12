import AWS from "aws-sdk";
import { fetchAuthSession } from "aws-amplify/auth";
import awsconfig from "../aws-exports.js";

// Function to calculate start and end timestamps based on the selected time range
const calculateTimeRange = (timeRange) => {
  const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  switch (timeRange) {
    case "7days":
      return { startTime: now - 604800, endTime: now }; // 604800 seconds = 7 days
    case "1month":
      return { startTime: now - 2592000, endTime: now }; // 2592000 seconds = 30 days (1 month)
    default:
      return { startTime: now - 604800, endTime: now }; // Default to 7 days
  }
};

// Helper function to round a value to 2 decimal places
const roundToTwoDecimals = (value) => {
  if (typeof value === "number") {
    return parseFloat(value.toFixed(2));
  }
  return value;
};

// Function to convert Unix timestamp to a readable date string
const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000); // Convert to milliseconds
  return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
};

// Function to extract the hour from a Unix timestamp
const extractHour = (timestamp) => {
  const date = new Date(timestamp * 1000); // Convert to milliseconds
  return date.getHours(); // Extract hour (0-23)
};

// Function to fetch all paginated data from DynamoDB
const fetchAllPaginatedData = async (docClient, params) => {
  let allItems = [];
  let lastEvaluatedKey = null;

  do {
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }

    console.log("Fetching data from DynamoDB...");
    const result = await docClient.query(params).promise();
    console.log(`Fetched ${result.Items.length} items in this batch.`);

    allItems = allItems.concat(result.Items);
    lastEvaluatedKey = result.LastEvaluatedKey;

    if (lastEvaluatedKey) {
      console.log("More items to fetch. Waiting for the next batch...");
    }
  } while (lastEvaluatedKey);

  console.log(`Total items fetched: ${allItems.length}`);
  return allItems;
};

// Function to fetch and structure data
export const fetchLastWeekData = async (selectedTagId, selectedTimeRange) => {
  try {
    const session = await fetchAuthSession();
    const credentials = session.credentials;

    // Use the optimized table with DocumentClient
    const docClient = new AWS.DynamoDB.DocumentClient({
      region: awsconfig.region,
      credentials,
    });

    const { startTime, endTime } = calculateTimeRange(selectedTimeRange);

    // Define the query parameters for the optimized table
    const params = {
      TableName: "CAN_BMS_Data_Optimized",
      KeyConditionExpression: "TagID = :tagId AND #ts BETWEEN :start AND :end",
      ExpressionAttributeNames: {
        "#ts": "Timestamp",
      },
      ExpressionAttributeValues: {
        ":tagId": `BAT-${selectedTagId}`,
        ":start": startTime,
        ":end": endTime,
      },
    };

    // Fetch all paginated data using DocumentClient
    const fetchedData = await fetchAllPaginatedData(docClient, params);

    console.log("Raw Fetched Data:", fetchedData);

    // Sort the data by timestamp in ascending order (data already in simple format with DocumentClient)
    console.log("Sorting data by timestamp...");
    fetchedData.sort((a, b) => a.Timestamp - b.Timestamp);

    // Group data by day
    console.log("Grouping data by day...");
    const dataByDay = {};
    fetchedData.forEach((item) => {
      const date = formatDate(item.Timestamp);
      if (!dataByDay[date]) {
        dataByDay[date] = [];
      }
      dataByDay[date].push(item);
    });

    console.log("Data grouped by day:", dataByDay);

    // Group data by hour for each day (only relevant parameters for peak usage)
    console.log("Grouping data by hour for each day...");
    const dataByHour = {};
    for (const [date, dailyData] of Object.entries(dataByDay)) {
      dataByHour[date] = {};

      dailyData.forEach((item) => {
        const hour = extractHour(item.Timestamp);
        if (!dataByHour[date][hour]) {
          dataByHour[date][hour] = [];
        }

        // Only include relevant parameters for peak usage
        dataByHour[date][hour].push({
          Timestamp: item.Timestamp,
          TotalCurrent:
            typeof item.TotalCurrent === "number"
              ? roundToTwoDecimals(item.TotalCurrent)
              : null,
        });
      });
    }

    console.log("Data grouped by hour for each day:", dataByHour);

    // Calculate peak usage hours for each day
    console.log("Calculating peak usage hours per day...");
    const peakUsageHours = {};
    for (const [date, hourlyData] of Object.entries(dataByHour)) {
      let peakCurrent = 0;
      let peakHour = 0;

      for (const [hour, hourData] of Object.entries(hourlyData)) {
        const maxCurrentInHour = Math.max(
          ...hourData.map((item) => parseFloat(item.TotalCurrent || 0))
        );

        if (maxCurrentInHour > peakCurrent) {
          peakCurrent = maxCurrentInHour;
          peakHour = parseInt(hour);
        }
      }

      if (peakCurrent > 0) {
        peakUsageHours[date] = {
          peakCurrent: roundToTwoDecimals(peakCurrent),
          peakHour,
        };
      }
    }

    console.log("Peak usage hours per day:", peakUsageHours);

    // Initialize structured data for Node0, Node1, Pack, Cell, Temperature, SOC, and Carbon Offset
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
      Carbon_Offset_kg: {
        Carbon_Offset_kg: null, // New field for Carbon Offset in kg
      },
      PeakUsageHours: peakUsageHours, // Add peak usage hours to structured data
      DataByHour: dataByHour, // Add hourly grouped data to structured data
    };

    // Iterate through all fetched data objects (now in simple format)
    fetchedData.forEach((item) => {
      // Process Node0 data
      for (let i = 0; i < 14; i++) {
        const cellKey = `Node00Cell${i < 10 ? `0${i}` : i}`;
        if (item[cellKey] !== undefined) {
          structuredData.Node0.voltage.cellVoltages[i].push(
            roundToTwoDecimals(item[cellKey])
          );
        }
      }

      // Process Node0 temperature keys (e.g., Node00Temp00, Node00Temp01, etc.)
      for (let i = 0; i < 6; i++) {
        const tempKey = `Node00Temp${i < 10 ? `0${i}` : i}`;
        if (item[tempKey] !== undefined) {
          // Initialize the array for this temperature sensor if it doesn't exist
          if (!structuredData.Node0.temperature[tempKey]) {
            structuredData.Node0.temperature[tempKey] = [];
          }
          // Append the temperature value to the respective sensor array
          structuredData.Node0.temperature[tempKey].push(
            roundToTwoDecimals(item[tempKey])
          );
        }
      }

      // Process Node1 data
      for (let i = 0; i < 14; i++) {
        const cellKey = `Node01Cell${i < 10 ? `0${i}` : i}`;
        if (item[cellKey] !== undefined) {
          structuredData.Node1.voltage.cellVoltages[i].push(
            roundToTwoDecimals(item[cellKey])
          );
        }
      }

      // Process Node1 temperature keys (e.g., Node01Temp00, Node01Temp01, etc.)
      for (let i = 0; i < 6; i++) {
        const tempKey = `Node01Temp${i < 10 ? `0${i}` : i}`;
        if (item[tempKey] !== undefined) {
          // Initialize the array for this temperature sensor if it doesn't exist
          if (!structuredData.Node1.temperature[tempKey]) {
            structuredData.Node1.temperature[tempKey] = [];
          }
          // Append the temperature value to the respective sensor array
          structuredData.Node1.temperature[tempKey].push(
            roundToTwoDecimals(item[tempKey])
          );
        }
      }

      // Process Pack-Level Data (now in simple format)
      structuredData.Pack = {
        numParallelNodes: item.PackNumParallelNodes || null,
        numNodes: item.PackNumNodes || null,
        thresholdOverCurrent:
          item.PackThresholdOverCurrent !== undefined
            ? roundToTwoDecimals(item.PackThresholdOverCurrent)
            : null,
        modes: item.PackModes || null,
        totalBattVoltage:
          item.TotalBattVoltage !== undefined
            ? roundToTwoDecimals(item.TotalBattVoltage)
            : null,
        totalLoadVoltage:
          item.TotalLoadVoltage !== undefined
            ? roundToTwoDecimals(item.TotalLoadVoltage)
            : null,
        totalCurrent:
          item.TotalCurrent !== undefined
            ? roundToTwoDecimals(item.TotalCurrent)
            : null,
        serialNumber: item.SerialNumber || null,
        state: item.State || null,
        events: item.Events || null,
      };

      // Process Cell-Level Data (now in simple format)
      structuredData.Cell = {
        maxCellVoltage:
          item.MaximumCellVoltage !== undefined
            ? roundToTwoDecimals(item.MaximumCellVoltage)
            : null,
        minCellVoltage:
          item.MinimumCellVoltage !== undefined
            ? roundToTwoDecimals(item.MinimumCellVoltage)
            : null,
        maxCellVoltageCellNo: item.MaximumCellVoltageCellNo || null,
        minCellVoltageCellNo: item.MinimumCellVoltageCellNo || null,
        maxCellVoltageNode: item.MaximumCellVoltageNode || null,
        minCellVoltageNode: item.MinimumCellVoltageNode || null,
        thresholdOverVoltage:
          item.CellThresholdOverVoltage !== undefined
            ? roundToTwoDecimals(item.CellThresholdOverVoltage)
            : null,
        thresholdUnderVoltage:
          item.CellThresholdUnderVoltage !== undefined
            ? roundToTwoDecimals(item.CellThresholdUnderVoltage)
            : null,
        criticalOverVoltThreshold:
          item.CellCriticalOverVoltThreshold !== undefined
            ? roundToTwoDecimals(item.CellCriticalOverVoltThreshold)
            : null,
        criticalUnderVoltThreshold:
          item.CellCriticalUnderVoltThreshold !== undefined
            ? roundToTwoDecimals(item.CellCriticalUnderVoltThreshold)
            : null,
        balanceThresholdVoltage:
          item.CellBalanceThresholdVoltage !== undefined
            ? roundToTwoDecimals(item.CellBalanceThresholdVoltage)
            : null,
      };

      // Process Temperature Data (now in simple format)
      structuredData.Temperature = {
        maxCellTemp:
          item.MaxCellTemp !== undefined
            ? roundToTwoDecimals(item.MaxCellTemp)
            : null,
        minCellTemp:
          item.MinCellTemp !== undefined
            ? roundToTwoDecimals(item.MinCellTemp)
            : null,
        maxCellTempNode: item.MaxCellTempNode || null,
        minCellTempNode: item.MinCellTempNode || null,
        thresholdOverTemp:
          item.TempThresholdOverTemp !== undefined
            ? roundToTwoDecimals(item.TempThresholdOverTemp)
            : null,
        thresholdUnderTemp:
          item.TempThresholdUnderTemp !== undefined
            ? roundToTwoDecimals(item.TempThresholdUnderTemp)
            : null,
      };

      // Process SOC Data (now in simple format)
      structuredData.SOC = {
        socPercent:
          item.SOCPercent !== undefined
            ? roundToTwoDecimals(item.SOCPercent)
            : null,
        socAh: item.SOCAh !== undefined ? roundToTwoDecimals(item.SOCAh) : null,
        balanceSOCPercent:
          item.BalanceSOCPercent !== undefined
            ? roundToTwoDecimals(item.BalanceSOCPercent)
            : null,
        balanceSOCAh:
          item.BalanceSOCAh !== undefined
            ? roundToTwoDecimals(item.BalanceSOCAh)
            : null,
      };

      // Process Carbon Offset Data (now in simple format)
      structuredData.Carbon_Offset_kg = {
        Carbon_Offset_kg:
          item.Carbon_Offset_kg !== undefined
            ? roundToTwoDecimals(item.Carbon_Offset_kg)
            : null,
      };
    });

    console.log(
      "Structured Data with Peak Usage Hours and Hourly Grouping:",
      structuredData
    );

    return structuredData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
