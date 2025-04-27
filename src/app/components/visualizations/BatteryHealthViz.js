import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Component to visualize battery health data
const BatteryHealthVisualization = ({ data }) => {
  if (!data || !data.processedData) return <p>No data available for visualization</p>;

  const { voltageStats, currentStats, temperatureStats, socHistory } = data.processedData;

  // Prepare SOC history data for chart
  const socChartData = socHistory.map(dataPoint => ({
    timestamp: new Date(dataPoint.timestamp * 1000).toLocaleDateString(),
    soc: dataPoint.value
  })).slice(-30); // Show last 30 data points for clarity

  // Prepare stats data for bar chart
  const statsData = [
    { name: "Voltage Min", value: voltageStats.min, fill: "#8884d8" },
    { name: "Voltage Avg", value: voltageStats.avg, fill: "#8884d8" },
    { name: "Voltage Max", value: voltageStats.max, fill: "#8884d8" },
    { name: "Current Min", value: currentStats.min, fill: "#82ca9d" },
    { name: "Current Avg", value: currentStats.avg, fill: "#82ca9d" },
    { name: "Current Max", value: currentStats.max, fill: "#82ca9d" },
    { name: "Temp Min", value: temperatureStats.min, fill: "#ffc658" },
    { name: "Temp Avg", value: temperatureStats.avg, fill: "#ffc658" },
    { name: "Temp Max", value: temperatureStats.max, fill: "#ffc658" },
  ];

  return (
    <div style={{ padding: "15px" }}>
      <h3 style={{ marginBottom: "15px", fontWeight: "500" }}>Battery Health Analysis</h3>
      
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Key Metrics</h4>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "15px", 
          justifyContent: "space-between" 
        }}>
          <div style={{ 
            backgroundColor: "#f0f4ff", 
            padding: "15px", 
            borderRadius: "8px",
            flex: "1 1 200px",
            minWidth: "200px" 
          }}>
            <div style={{ fontSize: "14px", color: "#666" }}>Battery Age</div>
            <div style={{ fontSize: "24px", fontWeight: "600", marginTop: "5px" }}>
              {data.processedData.estimatedAge} days
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: "#f0fff4", 
            padding: "15px", 
            borderRadius: "8px",
            flex: "1 1 200px",
            minWidth: "200px" 
          }}>
            <div style={{ fontSize: "14px", color: "#666" }}>Cycle Count</div>
            <div style={{ fontSize: "24px", fontWeight: "600", marginTop: "5px" }}>
              {data.processedData.cycleCount}
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: "#fff8f0", 
            padding: "15px", 
            borderRadius: "8px",
            flex: "1 1 200px",
            minWidth: "200px" 
          }}>
            <div style={{ fontSize: "14px", color: "#666" }}>Voltage Variation</div>
            <div style={{ fontSize: "24px", fontWeight: "600", marginTop: "5px" }}>
              {voltageStats.stdDev.toFixed(3)} V
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: "30px" }}>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>State of Charge History</h4>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={socChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="soc" stroke="#8884d8" name="SOC %" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Battery Parameter Statistics</h4>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BatteryHealthVisualization;