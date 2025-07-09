// src/utils/helpers.js

/**
 * Round a number to specified decimal places
 */
export const roundValue = (value, decimals = 2) => {
  if (typeof value !== "number") {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : parseFloat(num.toFixed(decimals));
  }
  return parseFloat(value.toFixed(decimals));
};

/**
 * Format timestamp to readable time
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";
  const date =
    typeof timestamp === "number"
      ? new Date(timestamp * 1000)
      : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/**
 * Format timestamp to readable date
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date =
    typeof timestamp === "number"
      ? new Date(timestamp * 1000)
      : new Date(timestamp);
  return date.toLocaleDateString();
};

/**
 * Safe number conversion for DynamoDB data
 */
export const safeNumberConversion = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
  if (value && typeof value === "object" && value.N) {
    const num = parseFloat(value.N);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

/**
 * Get nested object value safely
 */
export const getNestedValue = (obj, path, defaultValue = null) => {
  return (
    path.split(".").reduce((current, key) => current?.[key], obj) ??
    defaultValue
  );
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Calculate time range for different periods
 */
export const calculateTimeRange = (timeRange) => {
  const now = Math.floor(Date.now() / 1000);
  const ranges = {
    "1min": 60,
    "5min": 300,
    "1hour": 3600,
    "8hours": 28800,
    "1day": 86400,
    "7days": 604800,
    "1month": 2592000,
    "3months": 7776000,
    "6months": 15552000,
    "1year": 31536000,
  };

  const seconds = ranges[timeRange] || ranges["1day"];
  return {
    startTime: now - seconds,
    endTime: now,
  };
};

export default {
  roundValue,
  formatTime,
  formatDate,
  safeNumberConversion,
  getNestedValue,
  debounce,
  deepClone,
  calculateTimeRange,
};
