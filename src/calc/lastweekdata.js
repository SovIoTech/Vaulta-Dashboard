import AWS from "aws-sdk";
import { fetchAuthSession } from "aws-amplify/auth";
import awsconfig from "../aws-exports.js";
import { getDataByTagAndTimestamp } from "../queries.js";

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
const fetchAllPaginatedData = async (dynamoDB, params) => {
  let allItems = [];
  let lastEvaluatedKey = null;

  do {
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey; // Fetch the next set of items
    }

    console.log("Fetching data from DynamoDB...");
    const result = await dynamoDB.query(params).promise();
    console.log(`Fetched ${result.Items.length} items in this batch.`);

    allItems = allItems.concat(result.Items); // Add items to the result set
    lastEvaluatedKey = result.LastEvaluatedKey; // Update the LastEvaluatedKey

    if (lastEvaluatedKey) {
      console.log("More items to fetch. Waiting for the next batch...");
    }
  } while (lastEvaluatedKey); // Continue until there are no more items

  console.log(`Total items fetched: ${allItems.length}`);
  return allItems;
};

// Function to fetch and structure data
export const fetchLastWeekData = async (selectedTagId, selectedTimeRange) => {
  try {
    const session = await fetchAuthSession();
    const credentials = session.credentials;

    const dynamoDB = new AWS.DynamoDB({
      apiVersion: "2012-10-17",
      region: awsconfig.region,
      credentials,
    });

    const { startTime, endTime } = calculateTimeRange(selectedTimeRange);

    // Define the query parameters
    const params = {
      TableName: "CAN_BMS_Data",
      KeyConditionExpression: "TagID = :tagId AND #ts BETWEEN :start AND :end", // Use #ts as an alias for Timestamp
      ExpressionAttributeNames: {
        "#ts": "Timestamp", // Map #ts to the reserved keyword "Timestamp"
      },
      ExpressionAttributeValues: {
        ":tagId": { S: `BAT-${selectedTagId}` },
        ":start": { N: startTime.toString() },
        ":end": { N: endTime.toString() },
      },
    };

    // Fetch all paginated data
    const fetchedData = await fetchAllPaginatedData(dynamoDB, params);

    console.log("Raw Fetched Data:", fetchedData);

    // Sort the data by timestamp in ascending order
    console.log("Sorting data by timestamp...");
    fetchedData.sort((a, b) => a.Timestamp.N - b.Timestamp.N);

    // Group data by day
    console.log("Grouping data by day...");
    const dataByDay = {};
    fetchedData.forEach((item) => {
      const date = formatDate(parseInt(item.Timestamp.N));
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
        const hour = extractHour(parseInt(item.Timestamp.N));
        if (!dataByHour[date][hour]) {
          dataByHour[date][hour] = [];
        }

        // Only include relevant parameters for peak usage
        dataByHour[date][hour].push({
          Timestamp: item.Timestamp.N,
          TotalCurrent: item.TotalCurrent?.N
            ? roundToTwoDecimals(parseFloat(item.TotalCurrent.N))
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

    // Iterate through all fetched data objects
    fetchedData.forEach((item) => {
      // Process Node0 data
      for (let i = 0; i < 14; i++) {
        const cellKey = `Node00Cell${i < 10 ? `0${i}` : i}`;
        if (item[cellKey]?.N) {
          structuredData.Node0.voltage.cellVoltages[i].push(
            roundToTwoDecimals(parseFloat(item[cellKey].N)) // Round to 2 decimal places
          );
        }
      }

      // Process Node0 temperature keys (e.g., Node00Temp00, Node00Temp01, etc.)
      for (let i = 0; i < 6; i++) {
        const tempKey = `Node00Temp${i < 10 ? `0${i}` : i}`;
        if (item[tempKey]?.N) {
          // Initialize the array for this temperature sensor if it doesn't exist
          if (!structuredData.Node0.temperature[tempKey]) {
            structuredData.Node0.temperature[tempKey] = [];
          }
          // Append the temperature value to the respective sensor array
          structuredData.Node0.temperature[tempKey].push(
            roundToTwoDecimals(parseFloat(item[tempKey].N)) // Round to 2 decimal places
          );
        }
      }

      // Process Node1 data
      for (let i = 0; i < 14; i++) {
        const cellKey = `Node01Cell${i < 10 ? `0${i}` : i}`;
        if (item[cellKey]?.N) {
          structuredData.Node1.voltage.cellVoltages[i].push(
            roundToTwoDecimals(parseFloat(item[cellKey].N)) // Round to 2 decimal places
          );
        }
      }

      // Process Node1 temperature keys (e.g., Node01Temp00, Node01Temp01, etc.)
      for (let i = 0; i < 6; i++) {
        const tempKey = `Node01Temp${i < 10 ? `0${i}` : i}`;
        if (item[tempKey]?.N) {
          // Initialize the array for this temperature sensor if it doesn't exist
          if (!structuredData.Node1.temperature[tempKey]) {
            structuredData.Node1.temperature[tempKey] = [];
          }
          // Append the temperature value to the respective sensor array
          structuredData.Node1.temperature[tempKey].push(
            roundToTwoDecimals(parseFloat(item[tempKey].N)) // Round to 2 decimal places
          );
        }
      }

      // Process Pack-Level Data
      structuredData.Pack = {
        numParallelNodes: item.PackNumParallelNodes?.N || null,
        numNodes: item.PackNumNodes?.N || null,
        thresholdOverCurrent: item.PackThresholdOverCurrent?.N
          ? roundToTwoDecimals(parseFloat(item.PackThresholdOverCurrent.N))
          : null,
        modes: item.PackModes?.N || null,
        totalBattVoltage: item.TotalBattVoltage?.N
          ? roundToTwoDecimals(parseFloat(item.TotalBattVoltage.N))
          : null,
        totalLoadVoltage: item.TotalLoadVoltage?.N
          ? roundToTwoDecimals(parseFloat(item.TotalLoadVoltage.N))
          : null,
        totalCurrent: item.TotalCurrent?.N
          ? roundToTwoDecimals(parseFloat(item.TotalCurrent.N))
          : null,
        serialNumber: item.SerialNumber?.N || null,
        state: item.State?.S || null,
        events: item.Events?.N || null,
      };

      // Process Cell-Level Data
      structuredData.Cell = {
        maxCellVoltage: item.MaximumCellVoltage?.N
          ? roundToTwoDecimals(parseFloat(item.MaximumCellVoltage.N))
          : null,
        minCellVoltage: item.MinimumCellVoltage?.N
          ? roundToTwoDecimals(parseFloat(item.MinimumCellVoltage.N))
          : null,
        maxCellVoltageCellNo: item.MaximumCellVoltageCellNo?.N || null,
        minCellVoltageCellNo: item.MinimumCellVoltageCellNo?.N || null,
        maxCellVoltageNode: item.MaximumCellVoltageNode?.N || null,
        minCellVoltageNode: item.MinimumCellVoltageNode?.N || null,
        thresholdOverVoltage: item.CellThresholdOverVoltage?.N
          ? roundToTwoDecimals(parseFloat(item.CellThresholdOverVoltage.N))
          : null,
        thresholdUnderVoltage: item.CellThresholdUnderVoltage?.N
          ? roundToTwoDecimals(parseFloat(item.CellThresholdUnderVoltage.N))
          : null,
        criticalOverVoltThreshold: item.CellCriticalOverVoltThreshold?.N
          ? roundToTwoDecimals(parseFloat(item.CellCriticalOverVoltThreshold.N))
          : null,
        criticalUnderVoltThreshold: item.CellCriticalUnderVoltThreshold?.N
          ? roundToTwoDecimals(
              parseFloat(item.CellCriticalUnderVoltThreshold.N)
            )
          : null,
        balanceThresholdVoltage: item.CellBalanceThresholdVoltage?.N
          ? roundToTwoDecimals(parseFloat(item.CellBalanceThresholdVoltage.N))
          : null,
      };

      // Process Temperature Data
      structuredData.Temperature = {
        maxCellTemp: item.MaxCellTemp?.N
          ? roundToTwoDecimals(parseFloat(item.MaxCellTemp.N))
          : null,
        minCellTemp: item.MinCellTemp?.N
          ? roundToTwoDecimals(parseFloat(item.MinCellTemp.N))
          : null,
        maxCellTempNode: item.MaxCellTempNode?.N || null,
        minCellTempNode: item.MinCellTempNode?.N || null,
        thresholdOverTemp: item.TempThresholdOverTemp?.N
          ? roundToTwoDecimals(parseFloat(item.TempThresholdOverTemp.N))
          : null,
        thresholdUnderTemp: item.TempThresholdUnderTemp?.N
          ? roundToTwoDecimals(parseFloat(item.TempThresholdUnderTemp.N))
          : null,
      };

      // Process SOC Data
      structuredData.SOC = {
        socPercent: item.SOCPercent?.N
          ? roundToTwoDecimals(parseFloat(item.SOCPercent.N))
          : null,
        socAh: item.SOCAh?.N
          ? roundToTwoDecimals(parseFloat(item.SOCAh.N))
          : null,
        balanceSOCPercent: item.BalanceSOCPercent?.N
          ? roundToTwoDecimals(parseFloat(item.BalanceSOCPercent.N))
          : null,
        balanceSOCAh: item.BalanceSOCAh?.N
          ? roundToTwoDecimals(parseFloat(item.BalanceSOCAh.N))
          : null,
      };

      // Process Carbon Offset Data
      structuredData.Carbon_Offset_kg = {
        Carbon_Offset_kg: item.Carbon_Offset_kg?.N
          ? roundToTwoDecimals(parseFloat(item.Carbon_Offset_kg.N))
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
