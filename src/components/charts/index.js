// Chart components export
export { default as UniversalChart } from "./UniversalChart.jsx";
export { default as GaugeDisplay } from "./GaugeDisplay.jsx";
export { default as MetricsCarousel } from "./MetricsCarousel.jsx";

// Chart utility functions and constants
export const CHART_TYPES = {
  LINE: "line",
  BAR: "bar",
  PIE: "pie",
};

export const METRIC_TYPES = {
  GAUGE: "gauge",
  CHART: "chart",
};

// Default chart configurations
export const DEFAULT_CHART_CONFIG = {
  height: 300,
  responsive: true,
  maintainAspectRatio: false,
  showLegend: false,
  showGrid: true,
};

export const DEFAULT_GAUGE_CONFIG = {
  size: 140,
  showTitle: true,
  showValue: true,
  showStatus: true,
  showMinMax: false,
  thresholds: {
    warning: 60,
    critical: 90,
  },
};

export const DEFAULT_CAROUSEL_CONFIG = {
  itemsPerPage: 4,
  autoRotate: false,
  rotationInterval: 5000,
  showNavigation: true,
  showIndicators: true,
  layout: "grid",
};

// Helper functions for chart data processing
export const processMetricData = (bmsState, metricConfig) => {
  const { key, title, unit, min, max, formatValue } = metricConfig;

  const rawValue = bmsState[key]?.N || bmsState[key] || 0;
  const value = parseFloat(rawValue);

  return {
    title,
    value,
    unit,
    min,
    max,
    formatValue,
  };
};

export const createChartData = (labels, datasets) => ({
  labels,
  datasets: datasets.map((dataset) => ({
    ...dataset,
    data: dataset.data || [],
  })),
});

// Battery-specific metric configurations
export const BATTERY_METRICS = {
  SOC: {
    key: "SOCPercent",
    title: "State of Charge",
    unit: "%",
    min: 0,
    max: 100,
    thresholds: { warning: 20, critical: 10 },
  },
  VOLTAGE: {
    key: "TotalBattVoltage",
    title: "Battery Voltage",
    unit: "V",
    min: 0,
    max: 60,
    thresholds: { warning: 50, critical: 55 },
  },
  CURRENT: {
    key: "TotalCurrent",
    title: "Total Current",
    unit: "A",
    min: -20,
    max: 20,
    thresholds: { warning: 15, critical: 18 },
  },
  TEMPERATURE: {
    key: "MaxCellTemp",
    title: "Max Cell Temperature",
    unit: "°C",
    min: 0,
    max: 60,
    thresholds: { warning: 45, critical: 55 },
  },
};
