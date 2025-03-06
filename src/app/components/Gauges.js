import React from "react";
import CircularGauge from "./CircularGauge.js";

const Gauges = ({ bmsState, roundValue }) => {
  const gauges = [
    {
      title: "Max Cell Temp",
      value: roundValue(bmsState.MaxCellTemp?.N || 0),
      info: `Node: ${bmsState.MaxCellTempNode?.N || "N/A"}`,
      min: 0,
      max: 100, // Adjust based on your data
    },
    {
      title: "Max Cell Voltage",
      value: roundValue(bmsState.MaximumCellVoltage?.N || 0),
      info: `Cell: ${bmsState.MaximumCellVoltageCellNo?.N || "N/A"}, Node: ${
        bmsState.MaximumCellVoltageNode?.N || "N/A"
      }`,
      min: 0,
      max: 5, // Adjust based on your data
    },
    {
      title: "Min Cell Temp",
      value: roundValue(bmsState.MinCellTemp?.N || 0),
      info: `Node: ${bmsState.MinCellTempNode?.N || "N/A"}`,
      min: 0,
      max: 100, // Adjust based on your data
    },
    {
      title: "Min Cell Voltage",
      value: roundValue(bmsState.MinimumCellVoltage?.N || 0),
      info: `Cell: ${bmsState.MinimumCellVoltageCellNo?.N || "N/A"}, Node: ${
        bmsState.MinimumCellVoltageNode?.N || "N/A"
      }`,
      min: 0,
      max: 5, // Adjust based on your data
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "20px",
      }}
    >
      {gauges.map((gauge, index) => (
        <CircularGauge
          key={index}
          title={gauge.title}
          description={gauge.info} // Pass description as additional info
          percentage={gauge.value}
          min={gauge.min}
          max={gauge.max}
          currentValue={gauge.value}
          percentageChange={0} // Add percentage change if available
        />
      ))}
    </div>
  );
};

export default Gauges;
