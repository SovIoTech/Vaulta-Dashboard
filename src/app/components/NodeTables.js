import React, { useState } from "react";
import PropTypes from "prop-types";

const NodeTables = ({ nodeData, condensed = false, colors = {} }) => {
  const [activeView, setActiveView] = useState("voltages");

  // Define colors using provided colors object or fallback to defaults
  const tableColors = {
    textDark: colors.textDark || "#333333",
    textLight: colors.textLight || "#666666",
    primary: colors.primary || "#818181",
    secondary: colors.secondary || "#c0c0c0",
    accentGreen: colors.accentGreen || "#8BC34A",
    accentRed: colors.accentRed || "#FF0000",
    highlight: colors.highlight || "#FFC107",
    background: colors.background || "rgba(192, 192, 192, 0.1)",
  };

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
    } else {
      // temperatures
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
          backgroundColor:
            statusClass === "ok"
              ? tableColors.accentGreen
              : tableColors.accentRed,
          color: "white",
          padding: condensed ? "2px 5px" : "5px 10px",
          borderRadius: "2px",
          fontSize: condensed ? "0.75rem" : "0.85rem",
          fontWeight: "600",
          display: "inline-block",
          textAlign: "center",
          minWidth: condensed ? "40px" : "60px",
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
          borderRadius: "8px",
          padding: condensed ? "10px" : "15px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          flex: 1,
          margin: "0 5px",
          height: "100%",
          overflow: "auto",
          border: `1px solid ${tableColors.secondary}`,
        }}
      >
        <h3
          style={{
            fontWeight: "600",
            marginBottom: "10px",
            color: tableColors.textDark,
            fontSize: condensed ? "0.95rem" : "1.1rem",
            borderBottom: `1px solid ${tableColors.secondary}`,
            paddingBottom: "5px",
          }}
        >
          {node.node}{" "}
          {dataType === "voltages" ? "Cell Voltages" : "Temperatures"}
        </h3>
        <div
          style={{
            height: condensed ? "auto" : "calc(100% - 40px)",
            overflow: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
              fontSize: condensed ? "0.8rem" : "0.9rem",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: tableColors.background }}>
                <th
                  style={{
                    padding: condensed ? "5px 8px" : "8px 12px",
                    border: `1px solid ${tableColors.secondary}`,
                    color: tableColors.textDark,
                  }}
                >
                  {dataType === "voltages" ? "Cell" : "Sensor"}
                </th>
                <th
                  style={{
                    padding: condensed ? "5px 8px" : "8px 12px",
                    border: `1px solid ${tableColors.secondary}`,
                    color: tableColors.textDark,
                  }}
                >
                  {dataType === "voltages" ? "Voltage (V)" : "Temperature (°C)"}
                </th>
                <th
                  style={{
                    padding: condensed ? "5px 8px" : "8px 12px",
                    border: `1px solid ${tableColors.secondary}`,
                    color: tableColors.textDark,
                    textAlign: "center",
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
                      border: `1px solid ${tableColors.secondary}`,
                      color: tableColors.textDark,
                    }}
                  >
                    {dataType === "voltages" ? `Cell ${i}` : `Sensor ${i}`}
                  </td>
                  <td
                    style={{
                      padding: condensed ? "4px 8px" : "8px 12px",
                      border: `1px solid ${tableColors.secondary}`,
                      color: tableColors.textDark,
                    }}
                  >
                    {value}
                  </td>
                  <td
                    style={{
                      padding: condensed ? "4px 8px" : "8px 12px",
                      border: `1px solid ${tableColors.secondary}`,
                      textAlign: "center",
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
          marginBottom: condensed ? "10px" : "15px",
        }}
      >
        <button
          onClick={() => setActiveView("voltages")}
          style={{
            margin: "0 5px",
            padding: condensed ? "5px 15px" : "8px 16px",
            backgroundColor:
              activeView === "voltages" ? tableColors.accentGreen : "#ffffff",
            color: activeView === "voltages" ? "#fff" : tableColors.textDark,
            border: "none",
            borderRadius: "2px",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            fontSize: condensed ? "0.8rem" : "0.9rem",
          }}
        >
          Cell Voltages
        </button>
        <button
          onClick={() => setActiveView("temperatures")}
          style={{
            margin: "0 5px",
            padding: condensed ? "5px 15px" : "8px 16px",
            backgroundColor:
              activeView === "temperatures"
                ? tableColors.accentGreen
                : "#ffffff",
            color:
              activeView === "temperatures" ? "#fff" : tableColors.textDark,
            border: "none",
            borderRadius: "2px",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            fontSize: condensed ? "0.8rem" : "0.9rem",
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
          overflow: "hidden",
          height: "calc(100% - 50px)",
        }}
      >
        {nodeData.map((node, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              margin: "0 5px",
              height: "100%",
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
  condensed: PropTypes.bool,
  colors: PropTypes.object,
};

export default NodeTables;
