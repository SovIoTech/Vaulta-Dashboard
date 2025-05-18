import React from "react";

const Diagnostics = ({ bmsData }) => {
  const currentData = bmsData?.lastMinuteData?.[0] || {};

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          color: "#1259c3",
          marginBottom: "20px",
          borderBottom: "1px solid #e0e0e0",
          paddingBottom: "10px",
        }}
      >
        Battery Diagnostics
      </h1>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "10px",
        }}
      >
        <div
          style={{
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              marginBottom: "15px",
            }}
          >
            System Health Check
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            <div
              style={{
                flex: "1 1 300px",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ fontSize: "1rem", marginBottom: "10px" }}>
                Battery Status
              </h3>
              <p>State of Charge: {currentData.SOCPercent?.N || "N/A"}%</p>
              <p>
                Health Status:{" "}
                {parseFloat(currentData.SOH_Estimate?.N || 0) > 90
                  ? "Excellent"
                  : parseFloat(currentData.SOH_Estimate?.N || 0) > 70
                  ? "Good"
                  : "Needs Attention"}
              </p>
              <p>Temperature: {currentData.MaxCellTemp?.N || "N/A"}°C</p>
              <p>Voltage: {currentData.TotalBattVoltage?.N || "N/A"}V</p>
            </div>

            <div
              style={{
                flex: "1 1 300px",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ fontSize: "1rem", marginBottom: "10px" }}>
                System Alerts
              </h3>
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#e8f5e9",
                  borderRadius: "5px",
                  color: "#4caf50",
                  marginBottom: "10px",
                }}
              >
                No active alerts
              </div>
              <p>Last Diagnostic Run: {new Date().toLocaleDateString()}</p>
              <p>Alert History: 0 alerts in the past 30 days</p>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              marginBottom: "15px",
            }}
          >
            Diagnostic Tools
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            <div
              style={{
                flex: "1 1 300px",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ fontSize: "1rem", marginBottom: "10px" }}>
                Run Diagnostics
              </h3>
              <div style={{ marginBottom: "15px" }}>
                <select
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                  }}
                >
                  <option>Full System Check</option>
                  <option>Battery Health Test</option>
                  <option>Cell Balancing Test</option>
                  <option>Temperature Sensor Check</option>
                  <option>Voltage Calibration</option>
                </select>
              </div>
              <button
                style={{
                  backgroundColor: "#1259c3",
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Start Diagnostic
              </button>
            </div>

            <div
              style={{
                flex: "1 1 300px",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ fontSize: "1rem", marginBottom: "10px" }}>
                Export Logs
              </h3>
              <p style={{ marginBottom: "15px" }}>
                Download system logs for advanced troubleshooting and analysis.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  style={{
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  System Logs
                </button>
                <button
                  style={{
                    backgroundColor: "#ff9800",
                    color: "white",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  Error Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;
