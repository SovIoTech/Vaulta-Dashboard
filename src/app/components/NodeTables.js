// components/NodeTables.js
"use client";
import React from "react";

const NodeTables = ({ nodeData }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "20px",
      }}
    >
      {nodeData.map((node, index) => (
        <div
          key={index}
          style={{
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
            padding: "20px",
          }}
        >
          <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>
            {node.node} Cell Voltages
          </h3>
          <table
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Cell
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Voltage (V)
                </th>
              </tr>
            </thead>
            <tbody>
              {node.data.cellVoltages.map((voltage, i) => (
                <tr key={i}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    Cell {i}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {voltage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3
            style={{
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            {node.node} Temperatures
          </h3>
          <table
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Temp
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Value (°C)
                </th>
              </tr>
            </thead>
            <tbody>
              {node.data.temperatures.map((temp, i) => (
                <tr key={i}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    Temp {i}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {temp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: "10px" }}>Temp Count: {node.data.tempCount}</p>
        </div>
      ))}
    </div>
  );
};

export default NodeTables;
