import React from "react";
import PropTypes from "prop-types";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const BatteryMetricsCarousel = ({ bmsState, roundValue, containerRef }) => {
  // Helper function to calculate fill color based on value and max/min
  const calculateColor = (value, max) => {
    const percentage = (value / max) * 100;
    
    if (percentage >= 90) return "#8BC34A"; // Green for high values (good)
    if (percentage >= 60) return "#FFC107"; // Yellow for medium values
    if (percentage >= 30) return "#FF9800"; // Orange for lower values
    return "#dddddd"; // Grey for very low values
  };

  // Define the metrics cards data
  const metricsData = [
    {
      title: "State of Charge",
      value: parseFloat(bmsState.SOCPercent?.N || 0),
      maxValue: 100,
      unit: "%",
      additionalInfo: `${roundValue(bmsState.SOCAh?.N || 0)} of ${roundValue(14)} kWh`,
      status: "Charging • +4000W • 0.4C",
      statusColor: "#8BC34A"
    },
    {
      title: "State of Balance",
      value: 98, // Placeholder value
      maxValue: 100,
      unit: "%",
      additionalInfo: "MIN 3.35V • AVE 3.35V • MAX 3.37V",
      status: "All cells within optimal range",
      statusColor: "#8BC34A"
    },
    {
      title: "Battery Temperature",
      value: 36, // Placeholder value
      maxValue: 60,
      unit: "°C",
      additionalInfo: "MIN 35.5°C • MAX 37.5°C",
      status: "Temperature within safe range",
      statusColor: "#8BC34A"
    },
    {
      title: "State of Health",
      value: 95, // Placeholder value
      maxValue: 100,
      unit: "%",
      additionalInfo: "System Up-time: 99%",
      status: "Battery in excellent condition",
      statusColor: "#8BC34A"
    }
  ];

  return (
    <div style={{ 
      height: "100%",
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gridTemplateRows: "repeat(2, 1fr)",
      gap: "15px",
      padding: "10px"
    }}>
      {metricsData.map((metric, index) => (
        <div 
          key={index}
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "15px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <h3 style={{ 
            fontSize: "0.9rem", 
            marginBottom: "8px",
            textAlign: "center",
            color: "#333"
          }}>
            {metric.title}
          </h3>
          
          <div style={{
            width: "80%",
            maxWidth: "120px",
            margin: "0 auto 8px auto"
          }}>
            <CircularProgressbar
              value={metric.value}
              text={`${roundValue(metric.value)}${metric.unit}`}
              styles={buildStyles({
                textSize: '20px',
                pathColor: calculateColor(metric.value, metric.maxValue),
                textColor: "#333",
                trailColor: "#eee",
                pathTransitionDuration: 0.5
              })}
            />
          </div>
          
          <div style={{ 
            fontSize: "0.8rem", 
            color: "#666",
            textAlign: "center",
            marginBottom: "5px"
          }}>
            {metric.additionalInfo}
          </div>
          
          <div style={{ 
            fontSize: "0.75rem", 
            color: metric.statusColor,
            fontWeight: "bold",
            textAlign: "center"
          }}>
            {metric.status}
          </div>
        </div>
      ))}
    </div>
  );
};

BatteryMetricsCarousel.propTypes = {
  bmsState: PropTypes.object.isRequired,
  roundValue: PropTypes.func.isRequired,
  containerRef: PropTypes.object
};

export default BatteryMetricsCarousel;