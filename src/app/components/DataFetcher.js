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

    // Use the optimized queries based on time range with DocumentClient
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

    // Process fetched data (now in DocumentClient format - plain JSON)
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

      // Process Node0 temperature keys
      for (let i = 0; i < 6; i++) {
        const tempKey = `Node00Temp${i < 10 ? `0${i}` : i}`;
        if (item[tempKey] !== undefined) {
          if (!structuredData.Node0.temperature[tempKey]) {
            structuredData.Node0.temperature[tempKey] = [];
          }
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

      // Process Node1 temperature keys
      for (let i = 0; i < 6; i++) {
        const tempKey = `Node01Temp${i < 10 ? `0${i}` : i}`;
        if (item[tempKey] !== undefined) {
          if (!structuredData.Node1.temperature[tempKey]) {
            structuredData.Node1.temperature[tempKey] = [];
          }
          structuredData.Node1.temperature[tempKey].push(
            roundToTwoDecimals(item[tempKey])
          );
        }
      }

      // Process Pack-Level Data (all values are now direct, no .N needed)
      if (
        item.PackNumParallelNodes !== undefined ||
        item.TotalBattVoltage !== undefined ||
        item.TotalCurrent !== undefined
      ) {
        structuredData.Pack = {
          numParallelNodes:
            item.PackNumParallelNodes || structuredData.Pack.numParallelNodes,
          numNodes: item.PackNumNodes || structuredData.Pack.numNodes,
          thresholdOverCurrent:
            item.PackThresholdOverCurrent !== undefined
              ? roundToTwoDecimals(item.PackThresholdOverCurrent)
              : structuredData.Pack.thresholdOverCurrent,
          modes: item.PackModes || structuredData.Pack.modes,
          totalBattVoltage:
            item.TotalBattVoltage !== undefined
              ? roundToTwoDecimals(item.TotalBattVoltage)
              : structuredData.Pack.totalBattVoltage,
          totalLoadVoltage:
            item.TotalLoadVoltage !== undefined
              ? roundToTwoDecimals(item.TotalLoadVoltage)
              : structuredData.Pack.totalLoadVoltage,
          totalCurrent:
            item.TotalCurrent !== undefined
              ? roundToTwoDecimals(item.TotalCurrent)
              : structuredData.Pack.totalCurrent,
          serialNumber: item.SerialNumber || structuredData.Pack.serialNumber,
          state: item.State || structuredData.Pack.state,
          events: item.Events || structuredData.Pack.events,
        };
      }

      // Process Cell-Level Data
      if (
        item.MaximumCellVoltage !== undefined ||
        item.MinimumCellVoltage !== undefined
      ) {
        structuredData.Cell = {
          maxCellVoltage:
            item.MaximumCellVoltage !== undefined
              ? roundToTwoDecimals(item.MaximumCellVoltage)
              : structuredData.Cell.maxCellVoltage,
          minCellVoltage:
            item.MinimumCellVoltage !== undefined
              ? roundToTwoDecimals(item.MinimumCellVoltage)
              : structuredData.Cell.minCellVoltage,
          maxCellVoltageCellNo:
            item.MaximumCellVoltageCellNo ||
            structuredData.Cell.maxCellVoltageCellNo,
          minCellVoltageCellNo:
            item.MinimumCellVoltageCellNo ||
            structuredData.Cell.minCellVoltageCellNo,
          maxCellVoltageNode:
            item.MaximumCellVoltageNode ||
            structuredData.Cell.maxCellVoltageNode,
          minCellVoltageNode:
            item.MinimumCellVoltageNode ||
            structuredData.Cell.minCellVoltageNode,
          thresholdOverVoltage:
            item.CellThresholdOverVoltage !== undefined
              ? roundToTwoDecimals(item.CellThresholdOverVoltage)
              : structuredData.Cell.thresholdOverVoltage,
          thresholdUnderVoltage:
            item.CellThresholdUnderVoltage !== undefined
              ? roundToTwoDecimals(item.CellThresholdUnderVoltage)
              : structuredData.Cell.thresholdUnderVoltage,
          criticalOverVoltThreshold:
            item.CellCriticalOverVoltThreshold !== undefined
              ? roundToTwoDecimals(item.CellCriticalOverVoltThreshold)
              : structuredData.Cell.criticalOverVoltThreshold,
          criticalUnderVoltThreshold:
            item.CellCriticalUnderVoltThreshold !== undefined
              ? roundToTwoDecimals(item.CellCriticalUnderVoltThreshold)
              : structuredData.Cell.criticalUnderVoltThreshold,
          balanceThresholdVoltage:
            item.CellBalanceThresholdVoltage !== undefined
              ? roundToTwoDecimals(item.CellBalanceThresholdVoltage)
              : structuredData.Cell.balanceThresholdVoltage,
        };
      }

      // Process Temperature Data
      if (item.MaxCellTemp !== undefined || item.MinCellTemp !== undefined) {
        structuredData.Temperature = {
          maxCellTemp:
            item.MaxCellTemp !== undefined
              ? roundToTwoDecimals(item.MaxCellTemp)
              : structuredData.Temperature.maxCellTemp,
          minCellTemp:
            item.MinCellTemp !== undefined
              ? roundToTwoDecimals(item.MinCellTemp)
              : structuredData.Temperature.minCellTemp,
          maxCellTempNode:
            item.MaxCellTempNode || structuredData.Temperature.maxCellTempNode,
          minCellTempNode:
            item.MinCellTempNode || structuredData.Temperature.minCellTempNode,
          thresholdOverTemp:
            item.TempThresholdOverTemp !== undefined
              ? roundToTwoDecimals(item.TempThresholdOverTemp)
              : structuredData.Temperature.thresholdOverTemp,
          thresholdUnderTemp:
            item.TempThresholdUnderTemp !== undefined
              ? roundToTwoDecimals(item.TempThresholdUnderTemp)
              : structuredData.Temperature.thresholdUnderTemp,
        };
      }

      // Process SOC Data
      if (item.SOCPercent !== undefined || item.SOCAh !== undefined) {
        structuredData.SOC = {
          socPercent:
            item.SOCPercent !== undefined
              ? roundToTwoDecimals(item.SOCPercent)
              : structuredData.SOC.socPercent,
          socAh:
            item.SOCAh !== undefined
              ? roundToTwoDecimals(item.SOCAh)
              : structuredData.SOC.socAh,
          balanceSOCPercent:
            item.BalanceSOCPercent !== undefined
              ? roundToTwoDecimals(item.BalanceSOCPercent)
              : structuredData.SOC.balanceSOCPercent,
          balanceSOCAh:
            item.BalanceSOCAh !== undefined
              ? roundToTwoDecimals(item.BalanceSOCAh)
              : structuredData.SOC.balanceSOCAh,
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
