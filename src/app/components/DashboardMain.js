import React from "react";
import PropTypes from "prop-types";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardMain = ({ bmsState, roundValue }) => {
  // Mock data for visualizations
  const voltageData = [
    { name: '00:00', value: 3.8 },
    { name: '04:00', value: 3.7 },
    { name: '08:00', value: 3.6 },
    { name: '12:00', value: 3.9 },
    { name: '16:00', value: 4.0 },
    { name: '20:00', value: 3.9 },
    { name: '23:59', value: 3.8 },
  ];

  const temperatureData = [
    { name: '00:00', value: 28 },
    { name: '04:00', value: 26 },
    { name: '08:00', value: 30 },
    { name: '12:00', value: 34 },
    { name: '16:00', value: 36 },
    { name: '20:00', value: 32 },
    { name: '23:59', value: 30 },
  ];

  const currentData = [
    { name: '00:00', value: -5, fill: '#FF0000' },
    { name: '04:00', value: -8, fill: '#FF0000' },
    { name: '08:00', value: 3, fill: '#4CAF50' },
    { name: '12:00', value: 7, fill: '#4CAF50' },
    { name: '16:00', value: 5, fill: '#4CAF50' },
    { name: '20:00', value: -2, fill: '#FF0000' },
    { name: '23:59', value: -6, fill: '#FF0000' },
  ];

  const socData = [
    { name: 'Used', value: 100 - parseFloat(bmsState.SOCPercent?.N || 0), fill: '#FF5252' },
    { name: 'Available', value: parseFloat(bmsState.SOCPercent?.N || 0), fill: '#4CAF50' },
  ];

  // Key metrics in the top cards
  const keyMetrics = [
    { 
      label: "Battery Level", 
      value: `${roundValue(bmsState.SOCPercent?.N || 0)}%`,
      chart: (
        <div style={{ width: 50, height: 50, marginLeft: 'auto' }}>
          <CircularProgressbar 
            value={parseFloat(bmsState.SOCPercent?.N || 0)} 
            text={`${roundValue(bmsState.SOCPercent?.N || 0)}%`}
            styles={buildStyles({
              textSize: '28px',
              pathColor: "#4CAF50",
              textColor: "#333333",
              trailColor: "#f5f5f5"
            })}
          />
        </div>
      )
    },
    { 
      label: "Total Current", 
      value: `${roundValue(bmsState.TotalCurrent?.N || 0)}A`,
      chart: (
        <div style={{ width: 50, height: 50, marginLeft: 'auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData.slice(-3)}>
              <Bar dataKey="value" fill={(bmsState.TotalCurrent?.N || 0) > 0 ? "#4CAF50" : "#FF0000"} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    },
    { 
      label: "Battery Voltage", 
      value: `${roundValue(bmsState.TotalBattVoltage?.N || 0)}V`,
      chart: (
        <div style={{ width: 50, height: 50, marginLeft: 'auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={voltageData.slice(-3)}>
              <Line type="monotone" dataKey="value" stroke="#333333" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )
    },
    { 
      label: "Max Cell Temp", 
      value: `${roundValue(bmsState.MaxCellTemp?.N || 0)}°C`,
      chart: (
        <div style={{ width: 50, height: 50, marginLeft: 'auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={temperatureData.slice(-3)}>
              <Line type="monotone" dataKey="value" stroke="#FF9800" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )
    }
  ];

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Key Metrics Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(4, 1fr)", 
        gap: "10px",
        marginBottom: "10px" 
      }}>
        {keyMetrics.map((metric, index) => (
          <div key={index} style={{
            backgroundColor: "#fff",
            borderRadius: "2px",
            padding: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#757575" }}>{metric.label}</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "600", color: "#333333" }}>{metric.value}</div>
            </div>
            {metric.chart}
          </div>
        ))}
      </div>
      
      {/* Charts Grid */}
      <div style={{ 
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: "10px",
        flex: 1,
        height: "calc(100vh - 240px)" // Adjust based on other elements
      }}>
        {/* Main Charts Section */}
        <div style={{ 
          gridColumn: "1 / 2",
          gridRow: "1 / 3",
          display: "grid",
          gridTemplateRows: "1fr 1fr",
          gap: "10px"
        }}>
          {/* Voltage Chart */}
          <div style={{ 
            backgroundColor: "#fff",
            borderRadius: "2px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            padding: "10px",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ 
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: "5px",
              marginBottom: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: "600" }}>Voltage Trend (24h)</h3>
            </div>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={voltageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: "0.8rem" }} />
                  <Line type="monotone" dataKey="value" stroke="#333333" strokeWidth={2} dot={{ r: 2 }} name="Voltage (V)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Current Chart */}
          <div style={{ 
            backgroundColor: "#fff",
            borderRadius: "2px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            padding: "10px",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ 
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: "5px",
              marginBottom: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: "600" }}>Current Flow (24h)</h3>
            </div>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: "0.8rem" }} />
                  <Bar dataKey="value" fill="#8884d8" name="Current (A)">
                    {currentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#4CAF50' : '#FF0000'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Right Column Stats */}
        <div style={{ 
          gridColumn: "2 / 3",
          gridRow: "1 / 2",
          backgroundColor: "#fff",
          borderRadius: "2px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          padding: "10px",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ 
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: "5px",
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: "600" }}>Battery State</h3>
          </div>
          <div style={{ 
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1
          }}>
            <div style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={socData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {socData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 10, fontSize: "0.9rem", fontWeight: "600", color: "#333" }}>
              State of Charge: {roundValue(bmsState.SOCPercent?.N || 0)}%
            </div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>
              Capacity: {roundValue(bmsState.SOCAh?.N || 0)} Ah
            </div>
          </div>
        </div>
        
        {/* System Status Panel */}
        <div style={{ 
          gridColumn: "2 / 3",
          gridRow: "2 / 3",
          backgroundColor: "#fff",
          borderRadius: "2px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          padding: "10px",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ 
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: "5px",
            marginBottom: "10px"
          }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: "600" }}>System Status</h3>
          </div>
          
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "5px 0", color: "#666", fontWeight: "500" }}>Status:</td>
                  <td style={{ padding: "5px 0", textAlign: "right" }}>
                    <span style={{ 
                      backgroundColor: "#8BC34A", 
                      color: "white", 
                      padding: "2px 8px", 
                      borderRadius: "2px",
                      fontSize: "0.75rem" 
                    }}>
                      OPERATIONAL
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 0", color: "#666", fontWeight: "500" }}>Temperature:</td>
                  <td style={{ padding: "5px 0", textAlign: "right", fontWeight: "600" }}>
                    {roundValue(bmsState.MaxCellTemp?.N || 0)}°C
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 0", color: "#666", fontWeight: "500" }}>Activity:</td>
                  <td style={{ padding: "5px 0", textAlign: "right", fontWeight: "600" }}>
                    {parseFloat(bmsState.TotalCurrent?.N || 0) < 0 ? "Charging" : "Discharging"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 0", color: "#666", fontWeight: "500" }}>Total Power:</td>
                  <td style={{ padding: "5px 0", textAlign: "right", fontWeight: "600" }}>
                    {roundValue(parseFloat(bmsState.TotalBattVoltage?.N || 0) * parseFloat(bmsState.TotalCurrent?.N || 0))} W
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 0", color: "#666", fontWeight: "500" }}>Carbon Offset:</td>
                  <td style={{ padding: "5px 0", textAlign: "right", fontWeight: "600" }}>
                    {roundValue(bmsState.Carbon_Offset_kg?.N || 0)} kg
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 0", color: "#666", fontWeight: "500" }}>Uptime:</td>
                  <td style={{ padding: "5px 0", textAlign: "right", fontWeight: "600" }}>
                    7d 12h 43m
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 0", color: "#666", fontWeight: "500" }}>Last Update:</td>
                  <td style={{ padding: "5px 0", textAlign: "right", fontWeight: "600" }}>
                    {new Date().toLocaleTimeString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Footer Stats Bar */}
      <div style={{ 
        marginTop: "10px",
        backgroundColor: "#fff",
        borderRadius: "2px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        padding: "8px 15px",
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.75rem",
        color: "#666"
      }}>
        <div>System Version: 2.5.1</div>
        <div>Active Nodes: 2</div>
        <div>Total Capacity: {roundValue(bmsState.SOCAh?.N || 0)} Ah</div>
        <div>Total Energy: {(parseFloat(bmsState.SOCAh?.N || 0) * parseFloat(bmsState.TotalBattVoltage?.N || 0)).toFixed(2)} Wh</div>
        <div>Carbon Offset: {roundValue(bmsState.Carbon_Offset_kg?.N || 0)} kg</div>
        <div>Last Update: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

DashboardMain.propTypes = {
  bmsState: PropTypes.object.isRequired,
  roundValue: PropTypes.func.isRequired
};

export default DashboardMain;