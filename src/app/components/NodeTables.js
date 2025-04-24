import React, { useState } from "react";
import PropTypes from "prop-types";

const NodeTables = ({ nodeData, condensed = false }) => {
  const [activeView, setActiveView] = useState("voltages");

  // Renders status cell with color
  const renderStatus = (value, dataType) => {
    let status, statusClass;
    
    if (dataType === "voltages") {
      if (value > 4.2) {
        status = "ERROR";
        statusClass = "error";
      } else if (value < 3.0) {
        status = "ERROR";
        statusClass = "error";
      } else {
        status = "OK";
        statusClass = "ok";
      }
    } else { // temperatures
      if (value > 45) {
        status = "ERROR";
        statusClass = "error";
      } else if (value < 0) {
        status = "ERROR";
        statusClass = "error";
      } else {
        status = "OK";
        statusClass = "ok";
      }
    }
    
    return (
      <div
        style={{
          backgroundColor: statusClass === "ok" ? "#8BC34A" : "#FF0000",
          color: "white",
          padding: condensed ? "2px 5px" : "5px 10px",
          borderRadius: "2px",
          fontSize: condensed ? "0.75rem" : "0.85rem",
          fontWeight: "600",
          display: "inline-block",
          textAlign: "center",
          minWidth: condensed ? "40px" : "60px"
        }}
      >
        {status}
      </div>
    );
  };

  const renderTable = (dataType, node) => {
    const dataToRender =
      dataType === "voltages" ? node.data.cellVoltages : node.data.temperatures;

    return (
      <div
        style={{
          background: "#fff",
          borderRadius: "2px",
          padding: condensed ? "10px" : "20px",
          marginBottom: condensed ? "10px" : "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          flex: 1,
          margin: "0 5px",
        }}
      >
        <h3
          style={{
            fontWeight: "600",
            marginBottom: "10px",
            color: "#333333",
            fontSize: condensed ? "0.95rem" : "1.1rem"
          }}
        >
          {node.node} {dataType === "voltages" ? "Cell Voltages" : "Temperatures"}
        </h3>
        <div style={{ maxHeight: condensed ? "300px" : "none", overflow: "auto" }}>
          <table
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
              fontSize: condensed ? "0.8rem" : "0.9rem"
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th
                  style={{
                    padding: condensed ? "5px 8px" : "8px 12px",
                    border: "1px solid #e0e0e0",
                    color: "#333333",
                  }}
                >
                  {dataType === "voltages" ? "Cell" : "Sensor"}
                </th>
                <th
                  style={{
                    padding: condensed ? "5px 8px" : "8px 12px",
                    border: "1px solid #e0e0e0",
                    color: "#333333",
                  }}
                >
                  {dataType === "voltages" ? "Voltage (V)" : "Temperature (°C)"}
                </th>
                <th
                  style={{
                    padding: condensed ? "5px 8px" : "8px 12px",
                    border: "1px solid #e0e0e0",
                    color: "#333333",
                    textAlign: "center"
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {dataToRender.map((value, i) => (
                <tr key={i}>
                  <td
                    style={{
                      padding: condensed ? "4px 8px" : "8px 12px",
                      border: "1px solid #e0e0e0",
                      color: "#333333",
                    }}
                  >
                    {dataType === "voltages" ? `Cell ${i}` : `Sensor ${i}`}
                  </td>
                  <td
                    style={{
                      padding: condensed ? "4px 8px" : "8px 12px",
                      border: "1px solid #e0e0e0",
                      color: "#333333",
                    }}
                  >
                    {value}
                  </td>
                  <td
                    style={{
                      padding: condensed ? "4px 8px" : "8px 12px",
                      border: "1px solid #e0e0e0",
                      textAlign: "center"
                    }}
                  >
                    {renderStatus(value, dataType)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: condensed ? "10px" : "20px",
        }}
      >
        <button
          onClick={() => setActiveView("voltages")}
          style={{
            margin: "0 5px",
            padding: condensed ? "5px 15px" : "10px 20px",
            backgroundColor: activeView === "voltages" ? "#FF0000" : "#ffffff",
            color: activeView === "voltages" ? "#fff" : "#333333",
            border: "none",
            borderRadius: "2px",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            fontSize: condensed ? "0.8rem" : "0.9rem"
          }}
        >
          Cell Voltages
        </button>
        <button
          onClick={() => setActiveView("temperatures")}
          style={{
            margin: "0 5px",
            padding: condensed ? "5px 15px" : "10px 20px",
            backgroundColor:
              activeView === "temperatures" ? "#FF0000" : "#ffffff",
            color: activeView === "temperatures" ? "#fff" : "#333333",
            border: "none",
            borderRadius: "2px",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            fontSize: condensed ? "0.8rem" : "0.9rem"
          }}
        >
          Temperature Data
        </button>
      </div>

      {/* Tables - Side by Side */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "auto",
        }}
      >
        {nodeData.map((node, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              margin: "0 5px",
            }}
          >
            {renderTable(activeView, node)}
          </div>
        ))}
      </div>
    </div>
  );
};

NodeTables.propTypes = {
  nodeData: PropTypes.array.isRequired,
  condensed: PropTypes.bool
};

export default NodeTables;