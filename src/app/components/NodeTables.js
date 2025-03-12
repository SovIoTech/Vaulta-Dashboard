import React, { useState } from "react";

const NodeTables = ({ nodeData }) => {
  const [activeView, setActiveView] = useState("voltages"); // Toggle between voltages and temperatures

  const renderTable = (dataType, node) => {
    const dataToRender =
      dataType === "voltages" ? node.data.cellVoltages : node.data.temperatures;

    return (
      <div
        style={{
          background: "#fff", // White background
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)", // Subtle shadow
          flex: 1, // Equal width for both tables
          margin: "0 10px", // Add spacing between tables
        }}
      >
        <h3
          style={{
            fontWeight: "600",
            marginBottom: "15px",
            color: "#3c4b64",
          }}
        >
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
              {" "}
              {/* Light gray header */}
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #e0e0e0",
                  color: "#4f5d73",
                }}
              >
                {dataType === "voltages" ? "Cell" : "Temp"}
              </th>
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #e0e0e0",
                  color: "#4f5d73",
                }}
              >
                {dataType === "voltages" ? "Voltage (V)" : "Value (°C)"}
              </th>
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #e0e0e0",
                  color: "#4f5d73",
                }}
              >
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
                  ? "#dc3545" // Red
                  : status === "Low"
                  ? "#ffc107" // Yellow
                  : "#28a745"; // Green

              return (
                <tr key={i}>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #e0e0e0",
                      color: "#4f5d73",
                    }}
                  >
                    {dataType === "voltages" ? `Cell ${i}` : `Temp ${i}`}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #e0e0e0",
                      color: "#4f5d73",
                    }}
                  >
                    {value}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #e0e0e0",
                      color: statusColor,
                      fontWeight: "600",
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
          <p style={{ marginTop: "10px", color: "#6c757d" }}>
            Total Temp Count: {node.data.tempCount}
          </p>
        )}
      </div>
    );
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
            backgroundColor: activeView === "voltages" ? "#3c4b64" : "#f8f9fa",
            color: activeView === "voltages" ? "#fff" : "#4f5d73",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
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
              activeView === "temperatures" ? "#3c4b64" : "#f8f9fa",
            color: activeView === "temperatures" ? "#fff" : "#4f5d73",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Temperatures
        </button>
      </div>

      {/* Side-by-Side Tables */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "0 -10px", // Compensate for margin between tables
        }}
      >
        {nodeData.map((node, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flex: 1,
              margin: "0 10px", // Add spacing between tables
            }}
          >
            {renderTable(activeView, node)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodeTables;
