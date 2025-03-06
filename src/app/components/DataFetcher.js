import AWS from "aws-sdk";
import { fetchAuthSession } from "aws-amplify/auth";
import awsconfig from "../../aws-exports.js";
import { getDataByTagAndTimestamp } from "../../queries.js";

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

// Function to fetch and structure data
export const fetchData = async (selectedTagId, selectedTimeRange) => {
  try {
    const session = await fetchAuthSession();
    const credentials = session.credentials;

    const dynamoDB = new AWS.DynamoDB({
      apiVersion: "2012-08-10",
      region: awsconfig.region,
      credentials,
    });

    const { startTime, endTime } = calculateTimeRange(selectedTimeRange);

    const fetchedData = await getDataByTagAndTimestamp(
      dynamoDB,
      "CAN_BMS_Data",
      `BAT-${selectedTagId}`,
      startTime,
      endTime
    );

    // Log the raw fetched data
    console.log("Raw Fetched Data:", fetchedData);

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
      // Log the current item to debug
      console.log("Processing item:", item);

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
    });

    // Log the structured data
    console.log("Structured Data:", structuredData);

    return structuredData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
