import AWS from "aws-sdk";
import { fetchAuthSession } from "aws-amplify/auth";
import awsconfig from "../../aws-exports.js";
import {
  getLastMinuteData,
  getLastHourData,
  getLastDayData,
  getLastMonthData,
  getLast7DaysData,
  getTimeRangeData,
} from "../../queries.js";

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

    // Use DocumentClient for easier data handling
    const docClient = new AWS.DynamoDB.DocumentClient({
      apiVersion: "2012-10-17",
      region: awsconfig.region,
      credentials,
    });

    const batteryId = `BAT-${selectedTagId}`;
    let fetchedData = [];

    // Use the optimized queries based on time range
    switch (selectedTimeRange) {
      case "1min":
        fetchedData = await getLastMinuteData(docClient, batteryId);
        break;
      case "5min":
        // Use getTimeRangeData for 5 minutes
        const fiveMinAgo = Math.floor(Date.now() / 1000) - 300;
        const now = Math.floor(Date.now() / 1000);
        fetchedData = await getTimeRangeData(
          docClient,
          batteryId,
          fiveMinAgo,
          now
        );
        break;
      case "1hour":
        fetchedData = await getLastHourData(docClient, batteryId);
        break;
      case "8hours":
        // Use getTimeRangeData for 8 hours
        const eightHoursAgo = Math.floor(Date.now() / 1000) - 28800;
        const currentTime = Math.floor(Date.now() / 1000);
        fetchedData = await getTimeRangeData(
          docClient,
          batteryId,
          eightHoursAgo,
          currentTime
        );
        break;
      case "1day":
        fetchedData = await getLastDayData(docClient, batteryId);
        break;
      case "7days":
        fetchedData = await getLast7DaysData(docClient, batteryId);
        break;
      case "1month":
        fetchedData = await getLastMonthData(docClient, batteryId);
        break;
      default:
        // Default to last hour
        fetchedData = await getLastHourData(docClient, batteryId);
    }

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
      // Process Node0 data
      for (let i = 0; i < 14; i++) {
        const cellKey = `Node00Cell${i < 10 ? `0${i}` : i}`;
        if (item[cellKey] !== undefined) {
          structuredData.Node0.voltage.cellVoltages[i].push(
            roundToTwoDecimals(parseFloat(item[cellKey]))
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
            roundToTwoDecimals(parseFloat(item[tempKey]))
          );
        }
      }

      // Process Node1 data
      for (let i = 0; i < 14; i++) {
        const cellKey = `Node01Cell${i < 10 ? `0${i}` : i}`;
        if (item[cellKey] !== undefined) {
          structuredData.Node1.voltage.cellVoltages[i].push(
            roundToTwoDecimals(parseFloat(item[cellKey]))
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
            roundToTwoDecimals(parseFloat(item[tempKey]))
          );
        }
      }

      // Process Pack-Level Data
      structuredData.Pack = {
        numParallelNodes: item.PackNumParallelNodes || null,
        numNodes: item.PackNumNodes || null,
        thresholdOverCurrent: item.PackThresholdOverCurrent
          ? roundToTwoDecimals(parseFloat(item.PackThresholdOverCurrent))
          : null,
        modes: item.PackModes || null,
        totalBattVoltage: item.TotalBattVoltage
          ? roundToTwoDecimals(parseFloat(item.TotalBattVoltage))
          : null,
        totalLoadVoltage: item.TotalLoadVoltage
          ? roundToTwoDecimals(parseFloat(item.TotalLoadVoltage))
          : null,
        totalCurrent: item.TotalCurrent
          ? roundToTwoDecimals(parseFloat(item.TotalCurrent))
          : null,
        serialNumber: item.SerialNumber || null,
        state: item.State || null,
        events: item.Events || null,
      };

      // Process Cell-Level Data
      structuredData.Cell = {
        maxCellVoltage: item.MaximumCellVoltage
          ? roundToTwoDecimals(parseFloat(item.MaximumCellVoltage))
          : null,
        minCellVoltage: item.MinimumCellVoltage
          ? roundToTwoDecimals(parseFloat(item.MinimumCellVoltage))
          : null,
        maxCellVoltageCellNo: item.MaximumCellVoltageCellNo || null,
        minCellVoltageCellNo: item.MinimumCellVoltageCellNo || null,
        maxCellVoltageNode: item.MaximumCellVoltageNode || null,
        minCellVoltageNode: item.MinimumCellVoltageNode || null,
        thresholdOverVoltage: item.CellThresholdOverVoltage
          ? roundToTwoDecimals(parseFloat(item.CellThresholdOverVoltage))
          : null,
        thresholdUnderVoltage: item.CellThresholdUnderVoltage
          ? roundToTwoDecimals(parseFloat(item.CellThresholdUnderVoltage))
          : null,
        criticalOverVoltThreshold: item.CellCriticalOverVoltThreshold
          ? roundToTwoDecimals(parseFloat(item.CellCriticalOverVoltThreshold))
          : null,
        criticalUnderVoltThreshold: item.CellCriticalUnderVoltThreshold
          ? roundToTwoDecimals(parseFloat(item.CellCriticalUnderVoltThreshold))
          : null,
        balanceThresholdVoltage: item.CellBalanceThresholdVoltage
          ? roundToTwoDecimals(parseFloat(item.CellBalanceThresholdVoltage))
          : null,
      };

      // Process Temperature Data
      structuredData.Temperature = {
        maxCellTemp: item.MaxCellTemp
          ? roundToTwoDecimals(parseFloat(item.MaxCellTemp))
          : null,
        minCellTemp: item.MinCellTemp
          ? roundToTwoDecimals(parseFloat(item.MinCellTemp))
          : null,
        maxCellTempNode: item.MaxCellTempNode || null,
        minCellTempNode: item.MinCellTempNode || null,
        thresholdOverTemp: item.TempThresholdOverTemp
          ? roundToTwoDecimals(parseFloat(item.TempThresholdOverTemp))
          : null,
        thresholdUnderTemp: item.TempThresholdUnderTemp
          ? roundToTwoDecimals(parseFloat(item.TempThresholdUnderTemp))
          : null,
      };

      // Process SOC Data
      structuredData.SOC = {
        socPercent: item.SOCPercent
          ? roundToTwoDecimals(parseFloat(item.SOCPercent))
          : null,
        socAh: item.SOCAh ? roundToTwoDecimals(parseFloat(item.SOCAh)) : null,
        balanceSOCPercent: item.BalanceSOCPercent
          ? roundToTwoDecimals(parseFloat(item.BalanceSOCPercent))
          : null,
        balanceSOCAh: item.BalanceSOCAh
          ? roundToTwoDecimals(parseFloat(item.BalanceSOCAh))
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
