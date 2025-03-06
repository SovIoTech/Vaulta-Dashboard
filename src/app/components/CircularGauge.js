import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const CircularGauge = ({
  title,
  description,
  percentage,
  min,
  max,
  currentValue,
  percentageChange,
}) => {
  // Dynamic colors for percentage
  const gaugeColor =
    percentage > 70 ? "#28a745" : percentage > 40 ? "#ffc107" : "#dc3545";

  return (
    <div
      style={{
        width: "250px", // Reduced container width
        height: "400px", // Reduced container height
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "20px",
        margin: "20px",
        background: "#fff",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
      }}
    >
      {/* Title */}
      <h3
        style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#333",
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize: "14px",
            color: "#666",
            textAlign: "center",
            marginBottom: "15px",
          }}
        >
          {description}
        </p>
      )}

      {/* Min Value */}
      <div
        style={{
          fontSize: "14px",
          color: "#666",
          textAlign: "center",
        }}
        title="Minimum Value"
      >
        Min: {min}
      </div>

      {/* Circular Progress Bar */}
      <div
        style={{
          width: "150px", // Reduced width for the progress bar container
          height: "150px", // Reduced height for the progress bar container
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto 10px", // Center the progress bar
        }}
      >
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            pathColor: gaugeColor, // Dynamic color based on percentage
            textColor: "#333",
            textSize: "16px", // Adjusted text size
          })}
        />
      </div>

      {/* Delta (Percentage Change) */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Delta
        </div>
        <div
          style={{
            fontSize: "14px",
            color: percentageChange > 0 ? "#28a745" : "#dc3545",
            fontWeight: "500",
          }}
          title="Percentage Change"
        >
          {percentageChange > 0 ? (
            <>
              <FaArrowUp style={{ color: "#28a745" }} />{" "}
              {percentageChange.toFixed(2)}%
            </>
          ) : (
            <>
              <FaArrowDown style={{ color: "#dc3545" }} />{" "}
              {Math.abs(percentageChange).toFixed(2)}%
            </>
          )}
        </div>
      </div>

      {/* Max Value */}
      <div
        style={{
          fontSize: "14px",
          color: "#666",
          textAlign: "center",
        }}
        title="Maximum Value"
      >
        Max: {max}
      </div>
    </div>
  );
};

export default CircularGauge;
