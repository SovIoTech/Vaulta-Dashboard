// Gauges.js
import React from "react";
import CircularGauge from "./CircularGauge.js";

const Gauges = ({ bmsState, roundValue }) => {
  const gauges = [
    {
      title: "Max Cell Temp",
      value: roundValue(bmsState.MaxCellTemp?.N || 0),
      info: `Node: ${bmsState.MaxCellTempNode?.N || "N/A"}`,
    },
    {
      title: "Max Cell Voltage",
      value: roundValue(bmsState.MaximumCellVoltage?.N || 0),
      info: `Cell: ${bmsState.MaximumCellVoltageCellNo?.N || "N/A"}, Node: ${
        bmsState.MaximumCellVoltageNode?.N || "N/A"
      }`,
    },
    {
      title: "Min Cell Temp",
      value: roundValue(bmsState.MinCellTemp?.N || 0),
      info: `Node: ${bmsState.MinCellTempNode?.N || "N/A"}`,
    },
    {
      title: "Min Cell Voltage",
      value: roundValue(bmsState.MinimumCellVoltage?.N || 0),
      info: `Cell: ${bmsState.MinimumCellVoltageCellNo?.N || "N/A"}, Node: ${
        bmsState.MinimumCellVoltageNode?.N || "N/A"
      }`,
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
          percentage={gauge.value}
          min={0}
          max={100}
          currentValue={gauge.value}
          additionalInfo={gauge.info}
        />
      ))}
    </div>
  );
};

export default Gauges;
