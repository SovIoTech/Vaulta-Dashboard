import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DataViewer = ({ loading, error, data }) => {
  const [selectedNode, setSelectedNode] = useState("Node0"); // Toggle between Node0 and Node1
  const [selectedParameter, setSelectedParameter] = useState("Temperature"); // Toggle between Temperature and Voltage

  if (loading) {
    return (
      <p
        style={{
          fontSize: "14px",
          color: "#666", // Gray text for loading
          textAlign: "center",
        }}
      >
        Loading data...
      </p>
    );
  }

  if (error) {
    return (
      <p
        style={{
          fontSize: "14px",
          color: "#dc3545", // Red text for errors
          textAlign: "center",
        }}
      >
        {error}
      </p>
    );
  }

  if (!data) {
    return (
      <p
        style={{
          fontSize: "14px",
          color: "#666", // Gray text for no data
          textAlign: "center",
        }}
      >
        No data available.
      </p>
    );
  }

  // Helper function to transform temperature data for charts
  const transformTemperatureData = (temperatureData) => {
    const transformedData = [];
    Object.entries(temperatureData).forEach(([sensor, values]) => {
      values.forEach((value, index) => {
        if (!transformedData[index]) {
          transformedData[index] = { time: index + 1 };
        }
        transformedData[index][sensor] = value;
      });
    });
    return transformedData;
  };

  // Helper function to transform voltage data for charts
  const transformVoltageData = (voltageData) => {
    const transformedData = [];
    voltageData.cellVoltages.forEach((voltages, index) => {
      const timeData = { time: index + 1 };
      voltages.forEach((voltage, cellIndex) => {
        timeData[`Cell ${cellIndex + 1}`] = voltage; // Add voltage for each cell
      });
      transformedData.push(timeData);
    });
    return transformedData;
  };

  // Get the data for the selected node and parameter
  const nodeData = data[selectedNode];
  const graphData =
    selectedParameter === "Temperature"
      ? transformTemperatureData(nodeData.temperature)
      : transformVoltageData(nodeData.voltage);

  // Transform Pack data for a pie chart
  const packData = [
    { name: "Total Battery Voltage", value: data.Pack.totalBattVoltage },
    { name: "Total Load Voltage", value: data.Pack.totalLoadVoltage },
    { name: "Total Current", value: data.Pack.totalCurrent },
  ];

  // Transform Cell data for a bar chart
  const cellData = [
    { name: "Max Cell Voltage", value: data.Cell.maxCellVoltage },
    { name: "Min Cell Voltage", value: data.Cell.minCellVoltage },
    { name: "Threshold Over Voltage", value: data.Cell.thresholdOverVoltage },
    { name: "Threshold Under Voltage", value: data.Cell.thresholdUnderVoltage },
  ];

  // Transform Temperature data for a bar chart
  const temperatureData = [
    { name: "Max Cell Temp", value: data.Temperature.maxCellTemp },
    { name: "Min Cell Temp", value: data.Temperature.minCellTemp },
    { name: "Threshold Over Temp", value: data.Temperature.thresholdOverTemp },
    {
      name: "Threshold Under Temp",
      value: data.Temperature.thresholdUnderTemp,
    },
  ];

  // Transform SOC data for a pie chart
  const socData = [
    { name: "SOC Percent", value: data.SOC.socPercent },
    { name: "SOC Ah", value: data.SOC.socAh },
    { name: "Balance SOC Percent", value: data.SOC.balanceSOCPercent },
    { name: "Balance SOC Ah", value: data.SOC.balanceSOCAh },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Center everything horizontally
        justifyContent: "center", // Center everything vertically
        minHeight: "100vh",
        backgroundColor: "#ffffff", // White background
        color: "#333333", // Dark text
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#333333", // Dark text
            marginBottom: "10px",
          }}
        >
          Battery Management System Dashboard
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#666666", // Gray text
          }}
        >
          Monitor and analyze battery performance in real-time.
        </p>
      </div>

      {/* Top Section: Node-Specific Graph and Toggle Buttons */}
      <div
        style={{
          backgroundColor: "#f9f9f9", // Light card background
          borderRadius: "12px", // Rounded corners
          padding: "20px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Soft shadow
          width: "100%",
          maxWidth: "1200px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          {/* Toggle Buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              onClick={() => setSelectedNode("Node0")}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  selectedNode === "Node0" ? "#696cff" : "#e0e0e0",
                color: selectedNode === "Node0" ? "white" : "#333333",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "background-color 0.3s ease",
              }}
            >
              Node0
            </button>
            <button
              onClick={() => setSelectedNode("Node1")}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  selectedNode === "Node1" ? "#696cff" : "#e0e0e0",
                color: selectedNode === "Node1" ? "white" : "#333333",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "background-color 0.3s ease",
              }}
            >
              Node1
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              onClick={() => setSelectedParameter("Temperature")}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  selectedParameter === "Temperature" ? "#696cff" : "#e0e0e0",
                color:
                  selectedParameter === "Temperature" ? "white" : "#333333",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "background-color 0.3s ease",
              }}
            >
              Temperature
            </button>
            <button
              onClick={() => setSelectedParameter("Voltage")}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  selectedParameter === "Voltage" ? "#696cff" : "#e0e0e0",
                color: selectedParameter === "Voltage" ? "white" : "#333333",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "background-color 0.3s ease",
              }}
            >
              Voltage
            </button>
          </div>
        </div>

        {/* Node-Specific Graph */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {selectedParameter === "Temperature" ? (
            // Render Temperature Line Chart
            <LineChart width={600} height={250} data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="time" stroke="#666666" />
              <YAxis stroke="#666666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  color: "#333333",
                }}
              />
              {Object.keys(nodeData.temperature).map((sensor) => (
                <Line
                  key={sensor}
                  type="monotone"
                  dataKey={sensor}
                  stroke={`#${Math.floor(Math.random() * 16777215).toString(
                    16
                  )}`} // Random color
                />
              ))}
            </LineChart>
          ) : (
            // Render Voltage Line Chart (14 lines for each cell)
            <LineChart width={600} height={250} data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="time" stroke="#666666" />
              <YAxis stroke="#666666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  color: "#333333",
                }}
              />
              {Array.from({ length: 14 }).map((_, index) => (
                <Line
                  key={`Cell ${index + 1}`}
                  type="monotone"
                  dataKey={`Cell ${index + 1}`}
                  stroke={`#${Math.floor(Math.random() * 16777215).toString(
                    16
                  )}`} // Random color
                />
              ))}
            </LineChart>
          )}
        </div>
      </div>

      {/* Bottom Section: Remaining Graphs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)", // Two columns
          gap: "20px",
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        {/* Pack Data */}
        <div
          style={{
            backgroundColor: "#f9f9f9", // Light card background
            borderRadius: "12px", // Rounded corners
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Soft shadow
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#333333", // Dark text
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Pack Data
          </h3>

          {/* Pack Voltage and Current Pie Chart */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <PieChart width={300} height={200}>
              <Pie
                data={packData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                label
              >
                {packData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`#${Math.floor(Math.random() * 16777215).toString(
                      16
                    )}`}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  color: "#333333",
                }}
              />
            </PieChart>
          </div>
        </div>

        {/* Cell Data */}
        <div
          style={{
            backgroundColor: "#f9f9f9", // Light card background
            borderRadius: "12px", // Rounded corners
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Soft shadow
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#333333", // Dark text
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Cell Data
          </h3>

          {/* Cell Voltage Bar Chart */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BarChart width={300} height={200} data={cellData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666666" />
              <YAxis stroke="#666666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  color: "#333333",
                }}
              />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </div>
        </div>

        {/* Temperature Data */}
        <div
          style={{
            backgroundColor: "#f9f9f9", // Light card background
            borderRadius: "12px", // Rounded corners
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Soft shadow
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#333333", // Dark text
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Temperature Data
          </h3>

          {/* Temperature Bar Chart */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BarChart width={300} height={200} data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666666" />
              <YAxis stroke="#666666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  color: "#333333",
                }}
              />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </div>
        </div>

        {/* SOC Data */}
        <div
          style={{
            backgroundColor: "#f9f9f9", // Light card background
            borderRadius: "12px", // Rounded corners
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Soft shadow
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#333333", // Dark text
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            SOC Data
          </h3>

          {/* SOC Pie Chart */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <PieChart width={300} height={200}>
              <Pie
                data={socData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                label
              >
                {socData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`#${Math.floor(Math.random() * 16777215).toString(
                      16
                    )}`}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  color: "#333333",
                }}
              />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataViewer;
