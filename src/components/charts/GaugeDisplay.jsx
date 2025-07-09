import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { theme } from "../../styles/theme.js";
import { roundValue } from "../../utils/helpers.js";

/**
 * GaugeDisplay Component
 *
 * REPLACES:
 * - src/app/components/CircularGauge.js (COMPLETELY)
 * - Parts of src/app/components/Gauges.js (individual gauge rendering)
 *
 * This component combines the functionality of both CircularGauge and individual
 * gauge cards from the Gauges component.
 */

const GaugeDisplay = ({
  // Core props (from CircularGauge.js)
  title,
  description,
  value,
  min = 0,
  max = 100,
  unit = "",
  percentageChange, // For showing trend arrows

  // Additional props (from Gauges.js)
  additionalInfo = "",
  status, // Function or string for status
  showMinMax = true,
  showPercentageChange = true,
  showStatus = true,

  // Styling props
  size = 200, // Changed from 140 to match CircularGauge size
  colors = theme.colors,
  thresholds = { warning: 60, critical: 90 },

  // Layout props
  width = 300, // Fixed width like CircularGauge
  height = 510, // Fixed height like CircularGauge

  // Formatting
  formatValue = (val) => roundValue(val),
  className = "",
  style = {},
}) => {
  // Calculate percentage for the circular progress (same as CircularGauge)
  const percentage = ((value - min) / (max - min)) * 100;

  // Dynamic colors based on percentage (matches CircularGauge logic)
  const getGaugeColor = () => {
    if (percentage > 70) return colors.accentGreen || "#4CAF50";
    if (percentage > 40) return colors.highlight || "#FF9800";
    return colors.accentRed || "#F44336";
  };

  // Status text (enhanced from Gauges.js)
  const getStatusText = () => {
    if (typeof status === "function") {
      return status(percentage);
    }
    if (typeof status === "string") {
      return status;
    }
    // Default status logic
    if (percentage >= thresholds.critical) return "Critical";
    if (percentage >= thresholds.warning) return "Warning";
    return "Normal";
  };

  const gaugeColor = getGaugeColor();
  const statusText = getStatusText();

  return (
    <div
      className={`gauge-display ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: "1px solid #e6e6e6",
        borderRadius: "15px",
        padding: "20px",
        background: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
        ...style,
      }}
    >
      {/* Title - matches CircularGauge styling */}
      <h3
        style={{
          fontSize: "2rem",
          fontWeight: "600",
          color: colors.primary || "#1259c3",
          textAlign: "center",
          marginBottom: "1px",
        }}
      >
        {title}
      </h3>

      {/* Description - from CircularGauge */}
      {description && (
        <p
          style={{
            fontSize: "1.1rem",
            color: colors.textLight || "#757575",
            textAlign: "center",
            marginBottom: "15px",
          }}
        >
          {description}
        </p>
      )}

      {/* Min Value Display - from CircularGauge */}
      {showMinMax && (
        <div
          style={{
            fontSize: "1.1rem",
            color: colors.textLight || "#757575",
            textAlign: "center",
          }}
          title="Minimum Value"
        >
          Min: {formatValue(min)} {unit}
        </div>
      )}

      {/* Circular Progress Bar - enhanced from both components */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto 10px",
        }}
      >
        <CircularProgressbar
          value={percentage}
          text={`${formatValue(value)} ${unit}`}
          styles={buildStyles({
            pathColor: gaugeColor,
            textColor: colors.primary || "#1259c3",
            textSize: "16px",
            trailColor: colors.background || "#f2f2f2",
            pathTransitionDuration: 0.5,
          })}
        />
      </div>

      {/* Additional Info - from Gauges.js */}
      {additionalInfo && (
        <div
          style={{
            fontSize: "0.9rem",
            color: colors.textLight || "#757575",
            textAlign: "center",
            marginBottom: "10px",
            padding: "8px 12px",
            background: colors.background || "#f2f2f2",
            borderRadius: "8px",
            fontWeight: "500",
            border: `1px solid ${colors.secondary || "#e0e0e0"}`,
          }}
        >
          {additionalInfo}
        </div>
      )}

      {/* Delta (Percentage Change) - from CircularGauge */}
      {showPercentageChange && percentageChange !== undefined && (
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              color: colors.primary || "#1259c3",
            }}
          >
            Change
          </div>
          <div
            style={{
              fontSize: "1.1rem",
              color: percentageChange > 0 ? "#4CAF50" : "#F44336",
              fontWeight: "500",
            }}
            title="Percentage Change"
          >
            {percentageChange > 0 ? (
              <>
                <FaArrowUp style={{ color: "#4CAF50" }} />{" "}
                {percentageChange.toFixed(2)}%
              </>
            ) : (
              <>
                <FaArrowDown style={{ color: "#F44336" }} />{" "}
                {Math.abs(percentageChange).toFixed(2)}%
              </>
            )}
          </div>
        </div>
      )}

      {/* Status Badge - from Gauges.js */}
      {showStatus && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              padding: "6px 16px",
              backgroundColor: `${gaugeColor}20`,
              color: gaugeColor,
              borderRadius: "20px",
              fontWeight: "600",
              fontSize: "0.85rem",
              border: `1px solid ${gaugeColor}50`,
              display: "inline-block",
            }}
          >
            {statusText}
          </div>
        </div>
      )}

      {/* Max Value Display - from CircularGauge */}
      {showMinMax && (
        <div
          style={{
            fontSize: "0.9rem",
            color: colors.textLight || "#757575",
            textAlign: "center",
          }}
          title="Maximum Value"
        >
          Max: {formatValue(max)} {unit}
        </div>
      )}
    </div>
  );
};

export default GaugeDisplay;
