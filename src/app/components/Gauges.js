import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";

const Gauges = ({ bmsState, roundValue, colors = {} }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [history, setHistory] = useState({});
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Determine colors using provided colors object or fallback to defaults
  const gaugeColors = {
    textDark: colors.textDark || "#2c3e50",
    textLight: colors.textLight || "#666",
    primary: colors.primary || "#818181",
    secondary: colors.secondary || "#c0c0c0",
    accentGreen: colors.accentGreen || "#8BC34A",
    accentRed: colors.accentRed || "#F44336",
    highlight: colors.highlight || "#FFC107",
    background: colors.background || "rgba(192, 192, 192, 0.1)",
  };

  // Track history of values
  useEffect(() => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();

    const newHistory = { ...history };
    const gauges = [
      { key: "MaxCellTemp", value: bmsState.MaxCellTemp?.N },
      { key: "MaximumCellVoltage", value: bmsState.MaximumCellVoltage?.N },
      { key: "MinCellTemp", value: bmsState.MinCellTemp?.N },
      { key: "MinimumCellVoltage", value: bmsState.MinimumCellVoltage?.N },
    ];

    gauges.forEach((gauge) => {
      if (gauge.value !== undefined) {
        if (!newHistory[gauge.key]) {
          newHistory[gauge.key] = [];
        }
        newHistory[gauge.key].push({
          value: gauge.value,
          timestamp,
          time: now.getTime(),
        });

        // Keep only last 20 values
        if (newHistory[gauge.key].length > 20) {
          newHistory[gauge.key].shift();
        }
      }
    });

    setHistory(newHistory);
  }, [bmsState]);

  const calculateColor = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage >= 90) return gaugeColors.accentGreen;
    if (percentage >= 60) return gaugeColors.highlight;
    if (percentage >= 30) return gaugeColors.accentRed;
    return gaugeColors.primary;
  };

  const gauges = [
    {
      title: "Max Cell Temp",
      key: "MaxCellTemp",
      value: roundValue(bmsState.MaxCellTemp?.N || 0),
      info: `Node: ${bmsState.MaxCellTempNode?.N || "N/A"}`,
      min: 0,
      max: 100,
      unit: "°C",
      status: "Normal",
    },
    {
      title: "Max Cell Voltage",
      key: "MaximumCellVoltage",
      value: roundValue(bmsState.MaximumCellVoltage?.N || 0),
      info: `Cell: ${bmsState.MaximumCellVoltageCellNo?.N || "N/A"}, Node: ${
        bmsState.MaximumCellVoltageNode?.N || "N/A"
      }`,
      min: 0,
      max: 5,
      unit: "V",
      status: "Optimal",
    },
    {
      title: "Min Cell Temp",
      key: "MinCellTemp",
      value: roundValue(bmsState.MinCellTemp?.N || 0),
      info: `Node: ${bmsState.MinCellTempNode?.N || "N/A"}`,
      min: 0,
      max: 100,
      unit: "°C",
      status: "Stable",
    },
    {
      title: "Min Cell Voltage",
      key: "MinimumCellVoltage",
      value: roundValue(bmsState.MinimumCellVoltage?.N || 0),
      info: `Cell: ${bmsState.MinimumCellVoltageCellNo?.N || "N/A"}, Node: ${
        bmsState.MinimumCellVoltageNode?.N || "N/A"
      }`,
      min: 0,
      max: 5,
      unit: "V",
      status: "Good",
    },
  ];

  // Split gauges into pairs for two-card layout
  const pages = [
    [gauges[0], gauges[1]],
    [gauges[2], gauges[3]],
  ];

  const currentCards = pages[currentPage];
  const totalPages = pages.length;

  // Render the mini chart for historical data
  const MiniChart = ({ data, min, max, color }) => {
    if (!data || data.length < 2) return null;

    const chartHeight = 40;
    const chartWidth = "100%";
    const padding = 5;

    // Calculate points for the line
    const points = data
      .map((entry, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = ((max - entry.value) / (max - min)) * chartHeight;
        return `${x}% ${y}`;
      })
      .join(", ");

    return (
      <div
        style={{
          position: "relative",
          height: chartHeight,
          width: chartWidth,
          marginTop: "10px",
          opacity: 0.6,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 100 ${chartHeight}`}
          preserveAspectRatio="none"
        >
          {/* Grid line for min value */}
          <line
            x1="0"
            y1={chartHeight}
            x2="100%"
            y2={chartHeight}
            stroke={gaugeColors.secondary}
            strokeWidth="0.5"
          />

          {/* Grid line for max value */}
          <line
            x1="0"
            y1="0"
            x2="100%"
            y2="0"
            stroke={gaugeColors.secondary}
            strokeWidth="0.5"
          />

          {/* Main line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Hover area */}
          {data.map((entry, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = ((max - entry.value) / (max - min)) * chartHeight;

            return (
              <React.Fragment key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={hoveredPoint?.index === i ? 3 : 0}
                  fill={color}
                  style={{ transition: "r 0.2s ease" }}
                />
                <rect
                  x={x - 5}
                  y={0}
                  width={10}
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredPoint({ index: i, entry })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </React.Fragment>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            style={{
              position: "absolute",
              bottom: "100%",
              left: `${(hoveredPoint.index / (data.length - 1)) * 100}%`,
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {hoveredPoint.entry.value.toFixed(2)}
            {gauges.find((g) => g.key === data.key)?.unit}
            <br />
            {hoveredPoint.entry.timestamp}
          </div>
        )}
      </div>
    );
  };

  // Create a single gauge card
  const GaugeCard = ({ gauge }) => {
    const historyData = history[gauge.key] || [];
    const color = calculateColor(gauge.value, gauge.max);

    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "10px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          border: `1px solid ${gaugeColors.secondary}`,
          margin: "0 5px",
          height: "100%",
          minHeight: "300px", // Ensure consistent height
          position: "relative",
        }}
      >
        <h3
          style={{
            fontSize: "1.1rem",
            marginBottom: "8px",
            fontWeight: "600",
            color: gaugeColors.textDark,
            textAlign: "center",
          }}
        >
          {gauge.title}
        </h3>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            position: "relative",
          }}
        >
          {/* Centered gauge with consistent size */}
          <div
            style={{
              width: "120px",
              height: "120px",
              margin: "0 auto 10px",
              position: "relative",
            }}
          >
            <CircularProgressbar
              value={(gauge.value / gauge.max) * 100}
              text={`${gauge.value}${gauge.unit}`}
              styles={buildStyles({
                textSize: "22px",
                pathColor: color,
                textColor: gaugeColors.textDark,
                trailColor: gaugeColors.background,
                pathTransitionDuration: 0.5,
              })}
            />
          </div>

          <div
            style={{
              fontSize: "0.9rem",
              color: gaugeColors.textLight,
              marginBottom: "8px",
              padding: "6px 10px",
              background: gaugeColors.background,
              borderRadius: "6px",
              display: "block",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            {gauge.info}
          </div>

          <div
            style={{
              padding: "6px 12px",
              backgroundColor: `${color}20`,
              color: color,
              borderRadius: "20px",
              display: "inline-block",
              fontWeight: "600",
              fontSize: "0.85rem",
            }}
          >
            {gauge.status}
          </div>
        </div>

        {/* Mini chart at the bottom */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            right: "10px",
            height: "50px",
          }}
        >
          <MiniChart
            data={historyData}
            min={gauge.min}
            max={gauge.max}
            color={color}
            key={gauge.key}
          />
        </div>
      </div>
    );
  };

  // Function to handle swipe gestures
  const handleTouchStart = (e) => {
    const touchStartX = e.touches[0].clientX;
    const touchStartY = e.touches[0].clientY;

    const handleTouchMove = (e) => {
      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;

      // Calculate the distance moved horizontally and vertically
      const deltaX = touchStartX - touchEndX;
      const deltaY = touchStartY - touchEndY;

      // Only consider horizontal swipes that are more significant than vertical movement
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && currentPage < totalPages - 1) {
          // Swipe left, go to next
          setCurrentPage(currentPage + 1);
        } else if (deltaX < 0 && currentPage > 0) {
          // Swipe right, go to previous
          setCurrentPage(currentPage - 1);
        }

        // Clean up this handler after swipe detected
        document.removeEventListener("touchmove", handleTouchMove);
      }
    };

    // Add touch move listener
    document.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Clean up on touch end
    const cleanUp = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", cleanUp);
    };

    document.addEventListener("touchend", cleanUp, { once: true });
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: gaugeColors.background,
        borderRadius: "10px",
        overflow: "hidden",
      }}
      onTouchStart={handleTouchStart}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          style={{
            flex: 1,
            padding: "10px",
            display: "flex",
            alignItems: "stretch",
          }}
        >
          {currentCards.map((gauge, index) => (
            <GaugeCard key={index} gauge={gauge} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "10px",
        }}
      >
        {pages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index)}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background:
                index === currentPage
                  ? gaugeColors.accentGreen
                  : gaugeColors.secondary,
              border: "none",
              margin: "0 5px",
              padding: 0,
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: index === currentPage ? "scale(1.2)" : "scale(1)",
            }}
            aria-label={`View page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Gauges;
