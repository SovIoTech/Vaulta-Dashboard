"use client";
import React, { useState, useEffect } from "react";
import CircularGauge from "./CircularGauge.js"; // Ensure this is used
import LoadingSpinner from "./LoadingSpinner.js";

const Dashboard = ({ bmsData, signOut }) => {
  const [bmsState, setBmsState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // List of base IDs (only the first hex base ID from each line)
  const baseIds = [
    "0x100",
    "0x140",
    "0x180",
    "0x1C0",
    "0x200",
    "0x240",
    "0x280",
    "0x2C0",
    "0x400",
    "0x440",
    "0x480",
    "0x4C0",
    "0x500",
    "0x540",
    "0x580",
    "0x5C0",
    "0x600",
    "0x640",
    "0x680",
    "0x6C0",
    "0x740",
    "0x780",
  ];

  useEffect(() => {
    console.log("bmsData:", bmsData); // Debugging: Log bmsData
    if (
      bmsData &&
      bmsData.lastMinuteData &&
      bmsData.lastMinuteData.length > 0
    ) {
      console.log("Setting bmsState:", bmsData.lastMinuteData[0]); // Debugging: Log bmsState
      setBmsState(bmsData.lastMinuteData[0]);
    } else {
      console.error("bmsData is not in the expected format or is empty.");
    }
  }, [bmsData]);

  if (!bmsState) {
    return <LoadingSpinner />;
  }

  // Helper function to round values to two decimal places
  const roundValue = (value) => parseFloat(value).toFixed(2);

  // Extract node data
  const nodeData = [
    {
      node: "Node 00",
      data: {
        balanceStatus: roundValue(bmsState.Node00BalanceStatus?.N || 0),
        totalVoltage: roundValue(bmsState.Node00TotalVoltage?.N || 0),
        cellVoltages: Array.from({ length: 14 }, (_, i) =>
          roundValue(bmsState[`Node00Cell${i < 10 ? `0${i}` : i}`]?.N || 0)
        ),
        temperatures: Array.from({ length: 6 }, (_, i) =>
          roundValue(bmsState[`Node00Temp${i < 10 ? `0${i}` : i}`]?.N || 0)
        ),
        tempCount: roundValue(bmsState.Node00TempCount?.N || 0),
      },
    },
    {
      node: "Node 01",
      data: {
        balanceStatus: roundValue(bmsState.Node01BalanceStatus?.N || 0),
        totalVoltage: roundValue(bmsState.Node01TotalVoltage?.N || 0),
        cellVoltages: Array.from({ length: 14 }, (_, i) =>
          roundValue(bmsState[`Node01Cell${i < 10 ? `0${i}` : i}`]?.N || 0)
        ),
        temperatures: Array.from({ length: 6 }, (_, i) =>
          roundValue(bmsState[`Node01Temp${i < 10 ? `0${i}` : i}`]?.N || 0)
        ),
        tempCount: roundValue(bmsState.Node01TempCount?.N || 0),
      },
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "250px" : "60px",
          backgroundColor: "#333",
          color: "#fff",
          transition: "width 0.3s",
          padding: "20px",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
        {sidebarOpen && (
          <div>
            <h3 style={{ marginTop: "20px" }}>Menu</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ margin: "10px 0" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Page 1
                </button>
              </li>
              <li style={{ margin: "10px 0" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Page 2
                </button>
              </li>
              <li style={{ margin: "10px 0" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Page 3
                </button>
              </li>
              <li style={{ margin: "10px 0" }}>
                <button
                  onClick={signOut}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Log Out
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "20px",
        }}
      >
        {/* Top Banner */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
            marginBottom: "20px",
            position: "relative",
          }}
        >
          <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#333" }}>
            SovIoTech Solutions BMS Dashboard
          </h1>
          <div style={{ textAlign: "right" }}>
            <p>Device ID: {bmsState.DeviceId?.N || "N/A"}</p>
            <p>Serial Number: {bmsState.SerialNumber?.N || "N/A"}</p>
            <p>Tag ID: {bmsState.TagID?.S || "N/A"}</p>
          </div>

          {/* Dropdown Menu */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "160px",
            }}
          >
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                background: "#333",
                border: "none",
                color: "#fff",
                padding: "10px",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
            >
              Select Base ID ▼
            </button>
            {isDropdownOpen && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
                  marginTop: "5px",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {baseIds.map((baseId, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      borderBottom: "1px solid #ddd",
                      color: "#333",
                    }}
                    onClick={() => {
                      console.log("Selected Base ID:", baseId);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {baseId}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cards Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {[
            {
              title: "SOC",
              values: [
                { label: "Ah", value: roundValue(bmsState.SOCAh?.N || 0) },
                { label: "%", value: roundValue(bmsState.SOCPercent?.N || 0) },
              ],
            },
            {
              title: "Balance SOC",
              values: [
                {
                  label: "Ah",
                  value: roundValue(bmsState.BalanceSOCAh?.N || 0),
                },
                {
                  label: "%",
                  value: roundValue(bmsState.BalanceSOCPercent?.N || 0),
                },
              ],
            },
            {
              title: "Voltages",
              values: [
                {
                  label: "Load",
                  value: roundValue(bmsState.TotalLoadVoltage?.N || 0),
                },
                {
                  label: "Battery",
                  value: roundValue(bmsState.TotalBattVoltage?.N || 0),
                },
              ],
            },
            {
              title: "Total Current",
              values: [
                {
                  label: "Current",
                  value: roundValue(bmsState.TotalCurrent?.N || 0),
                },
              ],
            },
            {
              title: "Pack Info",
              values: [
                {
                  label: "Node Count",
                  value: roundValue(bmsState.PackNodeCount?.N || 0),
                },
                {
                  label: "Num Nodes",
                  value: roundValue(bmsState.PackNumNodes?.N || 0),
                },
                {
                  label: "Parallel Nodes",
                  value: roundValue(bmsState.PackNumParallelNodes?.N || 0),
                },
              ],
            },
          ].map((card, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                borderRadius: "10px",
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>
                {card.title}
              </h3>
              {card.values.map((item, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "20px",
                    padding: "10px",
                    margin: "10px 0",
                  }}
                >
                  <strong>{item.label}:</strong> {item.value}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Gauges Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {[
            {
              title: "Max Cell Temp",
              value: roundValue(bmsState.MaxCellTemp?.N || 0),
              info: `Node: ${bmsState.MaxCellTempNode?.N || "N/A"}`,
            },
            {
              title: "Max Cell Voltage",
              value: roundValue(bmsState.MaximumCellVoltage?.N || 0),
              info: `Cell: ${
                bmsState.MaximumCellVoltageCellNo?.N || "N/A"
              }, Node: ${bmsState.MaximumCellVoltageNode?.N || "N/A"}`,
            },
            {
              title: "Min Cell Temp",
              value: roundValue(bmsState.MinCellTemp?.N || 0),
              info: `Node: ${bmsState.MinCellTempNode?.N || "N/A"}`,
            },
            {
              title: "Min Cell Voltage",
              value: roundValue(bmsState.MinimumCellVoltage?.N || 0),
              info: `Cell: ${
                bmsState.MinimumCellVoltageCellNo?.N || "N/A"
              }, Node: ${bmsState.MinimumCellVoltageNode?.N || "N/A"}`,
            },
          ].map((gauge, index) => (
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

        {/* Node Tables Section */}
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
              <p style={{ marginTop: "10px" }}>
                Temp Count: {node.data.tempCount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
