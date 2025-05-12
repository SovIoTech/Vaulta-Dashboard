import AWS from "aws-sdk";
import { fetchAuthSession } from "aws-amplify/auth";
import awsconfig from "../../aws-exports.js";
import {
  getLastMinuteData,
  getLastHourData,
  getLastDayData,
  getLast7DaysData,
  getLastMonthData,
  getTimeRangeData,
} from "../../queries.js";

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

// Select the appropriate query function based on time range
const getQueryFunction = (timeRange) => {
  switch (timeRange) {
    case "1min":
    case "5min":
      return getLastMinuteData;
    case "1hour":
    case "8hours":
      return getLastHourData;
    case "1day":
      return getLastDayData;
    case "7days":
      return getLast7DaysData;
    case "1month":
      return getLastMonthData;
    default:
      return getTimeRangeData;
  }
};

// Function to fetch and structure data
export const fetchData = async (selectedTagId, selectedTimeRange) => {
  try {
    const session = await fetchAuthSession();
    const credentials = session.credentials;

    const dynamoDB = new AWS.DynamoDB.DocumentClient({
      apiVersion: "2012-10-17",
      region: awsconfig.region,
      credentials,
    });

    const { startTime, endTime } = calculateTimeRange(selectedTimeRange);
    const queryFunction = getQueryFunction(selectedTimeRange);

    // Fetch data using the optimized query
    const fetchedData = await queryFunction(
      dynamoDB,
      `BAT-${selectedTagId}`,
      startTime,
      endTime
    );

    // Log the raw fetched data
    console.log("Raw Fetched Data:", fetchedData);

    // Initialize structured data
    const structuredData = {
      Node0: {
        voltage: {
          cellVoltages: Array.from({ length: 14 }, () => []),
        },
        temperature: {},
      },
      Node1: {
        voltage: {
          cellVoltages: Array.from({ length: 14 }, () => []),
        },
        temperature: {},
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

    // Process each item in the fetched data
    fetchedData.forEach((item) => {
      // Process Node0 data
      for (let i = 0; i < 14; i++) {
        const cellKey = `Node00Cell${i < 10 ? `0${i}` : i}`;
        if (item[cellKey]) {
          structuredData.Node0.voltage.cellVoltages[i].push(
            roundToTwoDecimals(parseFloat(item[cellKey])) // Fixed: single closing parenthesis
          );
        }
      }

      // Process Node0 temperature
      for (let i = 0; i < 6; i++) {
        const tempKey = `Node00Temp${i < 10 ? `0${i}` : i}`;
        if (item[tempKey]) {
          if (!structuredData.Node0.temperature[tempKey]) {
            structuredData.Node0.temperature[tempKey] = [];
          }
          structuredData.Node0.temperature[tempKey].push(
            roundToTwoDecimals(parseFloat(item[tempKey])) // Fixed
          );
        }
      }

      // Process Node1 data
      for (let i = 0; i < 14; i++) {
        const cellKey = `Node01Cell${i < 10 ? `0${i}` : i}`;
        if (item[cellKey]) {
          structuredData.Node1.voltage.cellVoltages[i].push(
            roundToTwoDecimals(parseFloat(item[cellKey]))
          );
        }
      }

      // Process Node1 temperature
      for (let i = 0; i < 6; i++) {
        const tempKey = `Node01Temp${i < 10 ? `0${i}` : i}`;
        if (item[tempKey]) {
          if (!structuredData.Node1.temperature[tempKey]) {
            structuredData.Node1.temperature[tempKey] = [];
          }
          structuredData.Node1.temperature[tempKey].push(
            roundToTwoDecimals(parseFloat(item[tempKey]))
          );
        }
      }

      // Process Pack-Level Data (only set once per item)
      if (!structuredData.Pack.numParallelNodes) {
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
      }

      // Process Cell-Level Data (only set once per item)
      if (!structuredData.Cell.maxCellVoltage) {
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
            ? roundToTwoDecimals(
                parseFloat(item.CellCriticalUnderVoltThreshold)
              )
            : null,
          balanceThresholdVoltage: item.CellBalanceThresholdVoltage
            ? roundToTwoDecimals(parseFloat(item.CellBalanceThresholdVoltage))
            : null,
        };
      }

      // Process Temperature Data (only set once per item)
      if (!structuredData.Temperature.maxCellTemp) {
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
      }

      // Process SOC Data (only set once per item)
      if (!structuredData.SOC.socPercent) {
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
      }
    });

    // Log the structured data
    console.log("Structured Data:", structuredData);

    return structuredData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
