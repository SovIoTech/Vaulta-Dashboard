import React from "react";
import CircularGauge from "./CircularGauge.js";

const Gauges = ({ bmsState, roundValue }) => {
  const gauges = [
    {
      title: "Max Cell Temp",
      value: roundValue(bmsState.MaxCellTemp?.N || 0),
      info: `Node: ${bmsState.MaxCellTempNode?.N || "N/A"}`,
      min: 0,
      max: 100,
      unit: "°C", // Add unit for temperature
    },
    {
      title: "Max Cell Voltage",
      value: roundValue(bmsState.MaximumCellVoltage?.N || 0),
      info: `Cell: ${bmsState.MaximumCellVoltageCellNo?.N || "N/A"}, Node: ${
        bmsState.MaximumCellVoltageNode?.N || "N/A"
      }`,
      min: 0,
      max: 5,
      unit: "V", // Add unit for voltage
    },
    {
      title: "Min Cell Temp",
      value: roundValue(bmsState.MinCellTemp?.N || 0),
      info: `Node: ${bmsState.MinCellTempNode?.N || "N/A"}`,
      min: 0,
      max: 100,
      unit: "°C", // Add unit for temperature
    },
    {
      title: "Min Cell Voltage",
      value: roundValue(bmsState.MinimumCellVoltage?.N || 0),
      info: `Cell: ${bmsState.MinimumCellVoltageCellNo?.N || "N/A"}, Node: ${
        bmsState.MinimumCellVoltageNode?.N || "N/A"
      }`,
      min: 0,
      max: 5,
      unit: "V", // Add unit for voltage
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", // Flexible grid layout
        gap: "20px",
        width: "100%", // Occupy full width
      }}
    >
      {gauges.map((gauge, index) => (
        <CircularGauge
          key={index}
          title={gauge.title}
          description={gauge.info}
          value={gauge.value} // Pass the actual value
          min={gauge.min}
          max={gauge.max}
          unit={gauge.unit} // Pass the unit
        />
      ))}
    </div>
  );
};

export default Gauges;
