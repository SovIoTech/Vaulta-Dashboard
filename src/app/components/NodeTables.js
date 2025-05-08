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
          borderRadius: "15px", // Rounded corners for OneUI
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)", // OneUI shadow
          flex: 1, // Equal width for both tables
          margin: "0 10px", // Add spacing between tables
        }}
      >
        <h3
          style={{
            fontWeight: "600",
            marginBottom: "15px",
            color: "#1259c3", // OneUI blue
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
            borderRadius: "10px", // Rounded corners for OneUI
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              {" "}
              {/* OneUI light background */}
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #e6e6e6",
                  color: "#000000", // OneUI text color
                }}
              >
                {dataType === "voltages" ? "Cell" : "Sensor"}
              </th>
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #e6e6e6",
                  color: "#000000", // OneUI text color
                }}
              >
                {dataType === "voltages" ? "Voltage (V)" : "Temperature (°C)"}
              </th>
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #e6e6e6",
                  color: "#000000", // OneUI text color
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
                  ? "#F44336" // Red
                  : status === "Low"
                  ? "#FF9800" // Orange
                  : "#4CAF50"; // Green

              return (
                <tr key={i}>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #e6e6e6",
                      color: "#000000", // OneUI text color
                    }}
                  >
                    {dataType === "voltages" ? `Cell ${i}` : `Sensor ${i}`}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #e6e6e6",
                      color: "#000000", // OneUI text color
                    }}
                  >
                    {value}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #e6e6e6",
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
          <p style={{ marginTop: "10px", color: "#757575" }}>
            Total Sensor Count: {node.data.tempCount}
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
            backgroundColor: activeView === "voltages" ? "#1259c3" : "#ffffff",
            color: activeView === "voltages" ? "#fff" : "#000000",
            border: "none",
            borderRadius: "25px", // Rounded corners for OneUI
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
              activeView === "temperatures" ? "#1259c3" : "#ffffff",
            color: activeView === "temperatures" ? "#fff" : "#000000",
            border: "none",
            borderRadius: "25px", // Rounded corners for OneUI
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Temperature Data
        </button>
      </div>

      {/* Side-by-Side Tables */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "0 -10px", // Compensate for margin between tables
          flexWrap: "wrap", // Allow wrapping on small screens
        }}
      >
        {nodeData.map((node, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flex: "1 1 450px", // Allow responsive sizing
              margin: "0 10px", // Add spacing between tables
              minWidth: "300px", // Minimum width for readability
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
