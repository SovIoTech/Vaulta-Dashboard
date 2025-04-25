import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const BatteryMetricsCarousel = ({ bmsState, roundValue }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  useEffect(() => {
    // Auto-rotate carousel every 5 seconds
    const interval = setInterval(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % metricsCards.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Helper function to calculate fill color based on value and max/min
  const calculateColor = (value, max) => {
    const percentage = (value / max) * 100;
    
    if (percentage >= 90) return "#8BC34A"; // Green for high values (good)
    if (percentage >= 60) return "#FFC107"; // Yellow for medium values
    if (percentage >= 30) return "#FF9800"; // Orange for lower values
    return "#dddddd"; // Grey for very low values
  };

  // Define the metrics cards with their data and styling
  const metricsCards = [
    {
      title: "State of Charge",
      value: `${roundValue(bmsState.SOCPercent?.N || 0)}%`,
      maxValue: 100,
      render: () => {
        const value = parseFloat(bmsState.SOCPercent?.N || 0);
        return (
          <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "10px" }}>State of Charge</h3>
              <div style={{ fontSize: "2.2rem", fontWeight: "bold" }}>{roundValue(value)}%</div>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                {roundValue(bmsState.SOCAh?.N || 0)} of {roundValue(14)} kWh
              </div>
              <div style={{ fontSize: "0.8rem", marginTop: "10px" }}>
                <span style={{ color: "#8BC34A", fontWeight: "bold" }}>Charging</span> • +4000W • 0.4C
              </div>
            </div>
            <div style={{ width: "150px", height: "150px" }}>
              <CircularProgressbar
                value={value}
                text={`${roundValue(value)}%`}
                styles={buildStyles({
                  textSize: '24px',
                  pathColor: calculateColor(value, 100),
                  textColor: "#333",
                  trailColor: "#eee"
                })}
              />
            </div>
          </div>
        );
      }
    },
    {
      title: "State of Balance",
      value: "98%",
      maxValue: 100,
      render: () => {
        const value = 98; // From the reference image
        return (
          <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "10px" }}>State of Balance</h3>
              <div style={{ fontSize: "2.2rem", fontWeight: "bold" }}>{value}%</div>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                MIN 3.35V • AVE 3.35V • MAX 3.37V
              </div>
              <div style={{ fontSize: "0.8rem", marginTop: "10px" }}>
                All cells within optimal range
              </div>
            </div>
            <div style={{ width: "150px", height: "150px" }}>
              <CircularProgressbar
                value={value}
                text={`${value}%`}
                styles={buildStyles({
                  textSize: '24px',
                  pathColor: "#8BC34A",
                  textColor: "#333",
                  trailColor: "#eee"
                })}
              />
            </div>
          </div>
        );
      }
    },
    {
      title: "Battery Temperature",
      value: "36°C",
      maxValue: 60,
      render: () => {
        const value = 36; // From the reference image
        return (
          <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "10px" }}>Battery Temperature</h3>
              <div style={{ fontSize: "2.2rem", fontWeight: "bold" }}>{value}°C</div>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                MIN 35.5°C • MAX 37.5°C
              </div>
              <div style={{ fontSize: "0.8rem", marginTop: "10px" }}>
                Temperature within safe range
              </div>
            </div>
            <div style={{ width: "150px", height: "150px" }}>
              <CircularProgressbar
                value={(value / 60) * 100} // Normalize to percentage
                text={`${value}°C`}
                styles={buildStyles({
                  textSize: '24px',
                  pathColor: calculateColor(value, 60),
                  textColor: "#333",
                  trailColor: "#eee"
                })}
              />
            </div>
          </div>
        );
      }
    },
    {
      title: "State of Health",
      value: "95%",
      maxValue: 100,
      render: () => {
        const value = 95; // From the reference image
        return (
          <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "10px" }}>State of Health</h3>
              <div style={{ fontSize: "2.2rem", fontWeight: "bold" }}>{value}%</div>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                System Up-time: 99%
              </div>
              <div style={{ fontSize: "0.8rem", marginTop: "10px" }}>
                Battery in excellent condition
              </div>
            </div>
            <div style={{ width: "150px", height: "150px" }}>
              <CircularProgressbar
                value={value}
                text={`${value}%`}
                styles={buildStyles({
                  textSize: '24px',
                  pathColor: calculateColor(value, 100),
                  textColor: "#333",
                  trailColor: "#eee"
                })}
              />
            </div>
          </div>
        );
      }
    }
  ];
  
  // Navigate to previous card
  const prevCard = () => {
    setCurrentCardIndex((prevIndex) => 
      prevIndex === 0 ? metricsCards.length - 1 : prevIndex - 1
    );
  };
  
  // Navigate to next card
  const nextCard = () => {
    setCurrentCardIndex((prevIndex) => 
      (prevIndex + 1) % metricsCards.length
    );
  };

  return (
    <div style={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      position: "relative"
    }}>
      {/* Main card content */}
      <div style={{ 
        flex: 1,
        padding: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }}>
        {metricsCards[currentCardIndex].render()}
      </div>
      
      {/* Navigation buttons */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        padding: "10px 0"
      }}>
        <button 
          onClick={prevCard}
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: "#f2f2f2",
            border: "none",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            marginRight: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          ←
        </button>
        
        {/* Dots for navigation */}
        <div style={{ display: "flex" }}>
          {metricsCards.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentCardIndex(index)}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: currentCardIndex === index ? "#8BC34A" : "#ccc",
                margin: "0 5px",
                cursor: "pointer"
              }}
            />
          ))}
        </div>
        
        <button 
          onClick={nextCard}
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: "#f2f2f2",
            border: "none",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            marginLeft: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          →
        </button>
      </div>
    </div>
  );
};

BatteryMetricsCarousel.propTypes = {
  bmsState: PropTypes.object.isRequired,
  roundValue: PropTypes.func.isRequired
};

export default BatteryMetricsCarousel;