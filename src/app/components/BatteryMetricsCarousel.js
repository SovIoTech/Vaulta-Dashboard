import React from "react";
import PropTypes from "prop-types";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const BatteryMetricsCarousel = ({
  bmsState,
  roundValue,
  containerRef,
  colors = {},
}) => {
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
      value: 98, // Placeholder value
      maxValue: 100,
      unit: "%",
      additionalInfo: "MIN 3.35V • AVE 3.35V • MAX 3.37V",
      status: "All cells within optimal range",
      statusColor: colors.accentGreen || "#8BC34A",
    },
    {
      title: "Battery Temperature",
      value: 36, // Placeholder value
      maxValue: 60,
      unit: "°C",
      additionalInfo: "MIN 35.5°C • MAX 37.5°C",
      status: "Temperature within safe range",
      statusColor: colors.accentGreen || "#8BC34A",
    },
    {
      title: "State of Health",
      value: 95, // Placeholder value
      maxValue: 100,
      unit: "%",
      additionalInfo: "System Up-time: 99%",
      status: "Battery in excellent condition",
      statusColor: colors.accentGreen || "#8BC34A",
    },
  ];

  // Create a single metric card
  const MetricCard = ({ metric }) => (
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
        // Increased card size by 30%
        transform: "scale(1.3)",
        transformOrigin: "center",
        margin: "12%",
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
        }}
      >
        <CircularProgressbar
          value={metric.value}
          text={`${roundValue(metric.value)}${metric.unit}`}
          styles={buildStyles({
            textSize: "22px",
            pathColor: calculateColor(metric.value, metric.maxValue),
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
        }}
      >
        {metric.status}
      </div>
    </div>
  );

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
