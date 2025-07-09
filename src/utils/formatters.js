// src/utils/formatters.js
import { roundValue, formatTime, formatDate } from "./helpers";

/**
 * Format BMS data for display
 */
export const formatBMSData = (bmsState) => {
  if (!bmsState) return null;

  return {
    deviceId: bmsState.DeviceId?.N || "N/A",
    serialNumber: bmsState.SerialNumber?.N || "N/A",
    tagId: bmsState.TagID?.S || "N/A",
    socPercent: roundValue(bmsState.SOCPercent?.N || 0),
    socAh: roundValue(bmsState.SOCAh?.N || 0),
    totalBattVoltage: roundValue(bmsState.TotalBattVoltage?.N || 0),
    totalLoadVoltage: roundValue(bmsState.TotalLoadVoltage?.N || 0),
    totalCurrent: roundValue(bmsState.TotalCurrent?.N || 0),
    carbonOffset: roundValue(bmsState.Carbon_Offset_kg?.N || 0),
    maxCellTemp: roundValue(bmsState.MaxCellTemp?.N || 0),
    minCellTemp: roundValue(bmsState.MinCellTemp?.N || 0),
    maxCellVoltage: roundValue(bmsState.MaximumCellVoltage?.N || 0),
    minCellVoltage: roundValue(bmsState.MinimumCellVoltage?.N || 0),
    timestamp: bmsState.Timestamp?.N ? formatTime(bmsState.Timestamp.N) : "N/A",
  };
};

/**
 * Format metrics for cards
 */
export const formatMetrics = (bmsState) => {
  const formatted = formatBMSData(bmsState);
  if (!formatted) return [];

  return [
    {
      label: "Battery Level",
      value: `${formatted.socPercent}%`,
      icon: "🔋",
      color: "#4CAF50",
    },
    {
      label: "Total Current",
      value: `${formatted.totalCurrent}A`,
      icon: "⚡",
      color: "#2196F3",
    },
    {
      label: "Battery Voltage",
      value: `${formatted.totalBattVoltage}V`,
      icon: "🔌",
      color: "#FF9800",
    },
    {
      label: "Carbon Offset",
      value: `${formatted.carbonOffset}kg`,
      icon: "🌍",
      color: "#4CAF50",
    },
    {
      label: "Max Cell Temp",
      value: `${formatted.maxCellTemp}°C`,
      icon: "🌡️",
      color: "#F44336",
    },
    {
      label: "Capacity",
      value: `${formatted.socAh}Ah`,
      icon: "📊",
      color: "#9C27B0",
    },
  ];
};

/**
 * Format chart data
 */
export const formatChartData = (data, type = "line") => {
  if (!data || data.length === 0) return null;

  const timestamps = data.map((item) =>
    formatTime(item.Timestamp?.N || item.timestamp)
  );

  switch (type) {
    case "voltage":
      return {
        labels: timestamps,
        datasets: [
          {
            label: "Battery Voltage",
            data: data.map((item) => roundValue(item.TotalBattVoltage?.N || 0)),
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76, 175, 80, 0.1)",
          },
        ],
      };

    case "current":
      return {
        labels: timestamps,
        datasets: [
          {
            label: "Total Current",
            data: data.map((item) => roundValue(item.TotalCurrent?.N || 0)),
            borderColor: "#2196F3",
            backgroundColor: "rgba(33, 150, 243, 0.1)",
          },
        ],
      };

    case "temperature":
      return {
        labels: timestamps,
        datasets: [
          {
            label: "Max Cell Temperature",
            data: data.map((item) => roundValue(item.MaxCellTemp?.N || 0)),
            borderColor: "#FF9800",
            backgroundColor: "rgba(255, 152, 0, 0.1)",
          },
        ],
      };

    default:
      return {
        labels: timestamps,
        datasets: [
          {
            label: "Value",
            data: data.map((item) => roundValue(item.value || 0)),
            borderColor: "#1259c3",
            backgroundColor: "rgba(18, 89, 195, 0.1)",
          },
        ],
      };
  }
};

export default {
  formatBMSData,
  formatMetrics,
  formatChartData,
};
