import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const CircularGauge = ({
  title,
  description,
  value,
  min,
  max,
  unit,
  percentageChange,
}) => {
  // Calculate percentage for visualization
  const percentage = ((value - min) / (max - min)) * 100;

  // Dynamic colors for percentage
  const gaugeColor =
    percentage > 70 ? "#28a745" : percentage > 40 ? "#ffc107" : "#dc3545";

  return (
    <div
      style={{
        width: "250px", // Fixed width for consistency
        height: "400px", // Fixed height for consistency
        border: "1px solid #e0e0e0", // CoreUI border color
        borderRadius: "8px", // CoreUI border radius
        padding: "20px",
        background: "#fff", // CoreUI background color
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)", // CoreUI shadow
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
      }}
    >
      {/* Title */}
      <h3
        style={{
          fontSize: "1.25rem", // CoreUI font size
          fontWeight: "600", // CoreUI font weight
          color: "#3c4b64", // CoreUI primary text color
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
            fontSize: "0.9rem", // CoreUI font size
            color: "#6c757d", // CoreUI secondary text color
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
          fontSize: "0.9rem", // CoreUI font size
          color: "#6c757d", // CoreUI secondary text color
          textAlign: "center",
        }}
        title="Minimum Value"
      >
        Min: {min} {unit} {/* Display min value with unit */}
      </div>

      {/* Circular Progress Bar */}
      <div
        style={{
          width: "150px", // Fixed width for the progress bar container
          height: "150px", // Fixed height for the progress bar container
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto 10px", // Center the progress bar
        }}
      >
        <CircularProgressbar
          value={percentage}
          text={`${value} ${unit}`} // Display actual value and unit
          styles={buildStyles({
            pathColor: gaugeColor, // Dynamic color based on percentage
            textColor: "#3c4b64", // CoreUI primary text color
            textSize: "16px", // Adjusted text size
          })}
        />
      </div>

      {/* Delta (Percentage Change) */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <div
          style={{
            fontSize: "1rem", // CoreUI font size
            fontWeight: "600", // CoreUI font weight
            color: "#3c4b64", // CoreUI primary text color
          }}
        >
          Delta
        </div>
        <div
          style={{
            fontSize: "0.9rem", // CoreUI font size
            color: percentageChange > 0 ? "#28a745" : "#dc3545", // Dynamic color
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
          fontSize: "0.9rem", // CoreUI font size
          color: "#6c757d", // CoreUI secondary text color
          textAlign: "center",
        }}
        title="Maximum Value"
      >
        Max: {max} {unit} {/* Display max value with unit */}
      </div>
    </div>
  );
};

export default CircularGauge;
