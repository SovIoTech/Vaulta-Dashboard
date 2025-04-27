import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const BatteryMetricsCarousel = ({
  bmsState,
  roundValue,
  containerRef,
  colors = {},
}) => {
  // Generate historical data for visualization
  const [history, setHistory] = useState({
    SOCPercent: [85, 87, 89, 90, 92],
    SOB: [97, 97, 98, 98, 98],
    Temperature: [34, 35, 36, 36, 35],
    SOH: [96, 95, 95, 95, 95],
  });

  // Update history with new values on component update
  useEffect(() => {
    setHistory((prev) => {
      const newHistory = { ...prev };

      // Update SOC history
      if (bmsState.SOCPercent?.N) {
        const socValue = parseFloat(bmsState.SOCPercent.N);
        newHistory.SOCPercent = [...prev.SOCPercent.slice(1), socValue];
      }

      // Update Temperature history with MaxCellTemp
      if (bmsState.MaxCellTemp?.N) {
        const tempValue = parseFloat(bmsState.MaxCellTemp.N);
        newHistory.Temperature = [...prev.Temperature.slice(1), tempValue];
      }

      // For SOB and SOH, we'll use dummy updates since these values are placeholders
      newHistory.SOB = [...prev.SOB.slice(1), 98]; // Simulated State of Balance
      newHistory.SOH = [...prev.SOH.slice(1), 95]; // Simulated State of Health

      return newHistory;
    });
  }, [bmsState]);

  // Helper function to calculate fill color based on value and max
  const calculateColor = (value, max) => {
    const percentage = (value / max) * 100;

    if (percentage >= 90) return colors.accentGreen || "#8BC34A";
    if (percentage >= 60) return colors.highlight || "#FFC107";
    if (percentage >= 30) return colors.primary || "#FF9800";
    return colors.secondary || "#dddddd";
  };

  // Define the metrics cards data
  const metricsData = [
    {
      title: "State of Charge",
      key: "SOCPercent",
      value: parseFloat(bmsState.SOCPercent?.N || 0),
      maxValue: 100,
      unit: "%",
      additionalInfo: `${roundValue(bmsState.SOCAh?.N || 0)} of ${roundValue(
        14
      )} kWh`,
      status: "Charging • +4000W • 0.4C",
      statusColor: colors.accentGreen || "#8BC34A",
    },
    {
      title: "State of Balance",
      key: "SOB",
      value: 98, // Placeholder value
      maxValue: 100,
      unit: "%",
      additionalInfo: "MIN 3.35V • AVE 3.35V • MAX 3.37V",
      status: "All cells within optimal range",
      statusColor: colors.accentGreen || "#8BC34A",
    },
    {
      title: "Battery Temperature",
      key: "Temperature",
      value: parseFloat(bmsState.MaxCellTemp?.N || 36), // Use MaxCellTemp if available
      maxValue: 60,
      unit: "°C",
      additionalInfo: "MIN 35.5°C • MAX 37.5°C",
      status: "Temperature within safe range",
      statusColor: colors.accentGreen || "#8BC34A",
    },
    {
      title: "State of Health",
      key: "SOH",
      value: 95, // Placeholder value
      maxValue: 100,
      unit: "%",
      additionalInfo: "System Up-time: 99%",
      status: "Battery in excellent condition",
      statusColor: colors.accentGreen || "#8BC34A",
    },
  ];

  // Mini Graph component for historical data
  const MiniGraph = ({ data, color, min, max }) => {
    if (!data || data.length === 0) return null;

    const height = 40;
    const normalize = (value) => {
      // Convert value to a y-coordinate (0 = top, height = bottom)
      return height - ((value - min) / (max - min)) * height;
    };

    // Create points for polyline
    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100; // Percentage across width
        const y = normalize(value);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          height: `${height}px`,
          opacity: 0.3,
          overflow: "hidden",
        }}
      >
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  // Create a single metric card
  const MetricCard = ({ metric }) => {
    const color = calculateColor(metric.value, metric.maxValue);
    const historyData = history[metric.key] || [];

    return (
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "4px",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${colors.secondary || "#e0e0e0"}`,
          transition: "all 0.3s ease",
          height: "75%",
          transform: "scale(1.3)",
          transformOrigin: "center",
          margin: "12%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <h3
          style={{
            fontSize: "1.1rem",
            marginBottom: "4px",
            textAlign: "center",
            color: colors.textDark || "#333",
            fontWeight: "600",
          }}
        >
          {metric.title}
        </h3>

        <div
          style={{
            width: "80%",
            maxWidth: "120px",
            margin: "0 auto 8px auto",
            position: "relative",
            zIndex: "2", // Keep gauge above background graph
          }}
        >
          <CircularProgressbar
            value={metric.value}
            text={`${roundValue(metric.value)}${metric.unit}`}
            styles={buildStyles({
              textSize: "22px",
              pathColor: color,
              textColor: colors.textDark || "#333",
              trailColor: "#eee",
              pathTransitionDuration: 0.5,
            })}
          />
        </div>

        <div
          style={{
            fontSize: "0.9rem",
            color: colors.textLight || "#666",
            textAlign: "center",
            marginBottom: "5px",
            fontWeight: "500",
            position: "relative",
            zIndex: "2", // Keep text above background graph
          }}
        >
          {metric.additionalInfo}
        </div>

        <div
          style={{
            fontSize: "0.85rem",
            color: metric.statusColor,
            fontWeight: "bold",
            textAlign: "center",
            position: "relative",
            zIndex: "2", // Keep status above background graph
          }}
        >
          {metric.status}
        </div>

        {/* Background mini graph */}
        <MiniGraph
          data={historyData}
          color={color}
          min={0}
          max={metric.maxValue}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        height: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gridTemplateRows: "repeat(2, 1fr)",
        gap: "5px",
        padding: "5px",
      }}
    >
      {metricsData.map((metric, index) => (
        <MetricCard key={index} metric={metric} />
      ))}
    </div>
  );
};

BatteryMetricsCarousel.propTypes = {
  bmsState: PropTypes.object.isRequired,
  roundValue: PropTypes.func.isRequired,
  containerRef: PropTypes.object,
  colors: PropTypes.object,
};

export default BatteryMetricsCarousel;
