import React, { useState } from "react";

const NodeTables = ({ nodeData }) => {
  const [activeView, setActiveView] = useState("voltages"); // Toggle between voltages and temperatures

  const renderTable = (dataType) => {
    return nodeData.map((node, index) => {
      const dataToRender =
        dataType === "voltages"
          ? node.data.cellVoltages
          : node.data.temperatures;

      return (
        <div
          key={index}
          style={{
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>
            {node.node}{" "}
            {dataType === "voltages" ? "Cell Voltages" : "Temperatures"}
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
                  {dataType === "voltages" ? "Cell" : "Temp"}
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {dataType === "voltages" ? "Voltage (V)" : "Value (°C)"}
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {dataToRender.map((value, i) => {
                const status =
                  dataType === "voltages"
                    ? value > 4.2
                      ? "High"
                      : value < 3.0
                      ? "Low"
                      : "Normal"
                    : value > 45
                    ? "Critical"
                    : value < 0
                    ? "Low"
                    : "Normal";

                const statusColor =
                  status === "High" || status === "Critical"
                    ? "red"
                    : status === "Low"
                    ? "orange"
                    : "green";

                return (
                  <tr key={i}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {dataType === "voltages" ? `Cell ${i}` : `Temp ${i}`}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {value}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        color: statusColor,
                        fontWeight: "bold",
                      }}
                    >
                      {status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {dataType === "voltages" && (
            <p style={{ marginTop: "10px", color: "#666" }}>
              Total Temp Count: {node.data.tempCount}
            </p>
          )}
        </div>
      );
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveView("voltages")}
          style={{
            margin: "0 10px",
            padding: "10px 20px",
            backgroundColor: activeView === "voltages" ? "#007bff" : "#f8f9fa",
            color: activeView === "voltages" ? "white" : "black",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Cell Voltages
        </button>
        <button
          onClick={() => setActiveView("temperatures")}
          style={{
            margin: "0 10px",
            padding: "10px 20px",
            backgroundColor:
              activeView === "temperatures" ? "#007bff" : "#f8f9fa",
            color: activeView === "temperatures" ? "white" : "black",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Temperatures
        </button>
      </div>
      {renderTable(activeView)}
    </div>
  );
};

export default NodeTables;
