// src/utils/constants.js

export const TIME_RANGES = [
  { label: "Last 1 Minute", value: "1min" },
  { label: "Last 5 Minutes", value: "5min" },
  { label: "Last 1 Hour", value: "1hour" },
  { label: "Last 8 Hours", value: "8hours" },
  { label: "Last 1 Day", value: "1day" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 1 Month", value: "1month" },
];

export const CHUNK_OPTIONS = [2, 4, 8, 12, 16, 24, 32];

export const MENU_ITEMS = [
  { icon: "📊", label: "Dashboard", path: "/dashboard" },
  { icon: "👥", label: "User Management", path: "/user-management" },
  { icon: "📈", label: "Data Analytics", path: "/analytics" },
  { icon: "🧠", label: "ML Dashboard", path: "/ml-dashboard" },
  { icon: "⚙️", label: "System Settings", path: "/settings" },
  { icon: "🔋", label: "Energy Monitor", path: "/energy-monitor" },
];

export const CHART_TYPES = {
  LINE: "line",
  BAR: "bar",
  PIE: "pie",
  GAUGE: "gauge",
};

export const DATA_STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  IDLE: "idle",
};

export default {
  TIME_RANGES,
  CHUNK_OPTIONS,
  MENU_ITEMS,
  CHART_TYPES,
  DATA_STATUS,
};
