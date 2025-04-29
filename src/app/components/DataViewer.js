import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

// Updated color scheme to match industrial UI style
const colors = {
  primary: "#818181",
  secondary: "#c0c0c0",
  accentGreen: "#4CAF50",
  accentRed: "#F44336",
  accentBlue: "#2196F3",
  background: "rgba(192, 192, 192, 0.1)",
  textDark: "#333333",
  textLight: "#555555",
  highlight: "#FFC107",
};

const DataViewer = ({ loading, error, data }) => {
  const [selectedNode, setSelectedNode] = useState("Node0");
  const [selectedParameter, setSelectedParameter] = useState("Temperature");

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: colors.textLight,
        }}
      >
        Loading data...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: colors.background,
          borderRadius: "8px",
          color: colors.accentRed,
          textAlign: "center",
          border: `1px solid ${colors.secondary}`,
        }}
      >
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: colors.textLight,
        }}
      >
        No data available.
      </div>
    );
  }

  // Helper functions to transform data
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

  const transformVoltageData = (voltageData) => {
    const transformedData = [];
    voltageData.cellVoltages.forEach((voltages, index) => {
      const timeData = { time: index + 1 };
      voltages.forEach((voltage, cellIndex) => {
        timeData[`Cell ${cellIndex + 1}`] = voltage;
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

  // Data for metrics
  const packData = [
    { name: "Total Battery Voltage", value: data.Pack.totalBattVoltage },
    { name: "Total Load Voltage", value: data.Pack.totalLoadVoltage },
    { name: "Total Current", value: data.Pack.totalCurrent },
  ];

  const cellData = [
    { name: "Max Cell Voltage", value: data.Cell.maxCellVoltage },
    { name: "Min Cell Voltage", value: data.Cell.minCellVoltage },
    { name: "Threshold Over Voltage", value: data.Cell.thresholdOverVoltage },
    { name: "Threshold Under Voltage", value: data.Cell.thresholdUnderVoltage },
  ];

  const temperatureData = [
    { name: "Max Cell Temp", value: data.Temperature.maxCellTemp },
    { name: "Min Cell Temp", value: data.Temperature.minCellTemp },
    { name: "Threshold Over Temp", value: data.Temperature.thresholdOverTemp },
    {
      name: "Threshold Under Temp",
      value: data.Temperature.thresholdUnderTemp,
    },
  ];

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
        height: "100%",
        gap: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Main content area - side by side containers */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: "20px",
          minHeight: "700px",
        }}
      >
        {/* Left container - Four metrics in square layout */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: "15px",
          }}
        >
          {/* Pack Data */}
          <div
            style={{
              backgroundColor: colors.background,
              borderRadius: "8px",
              padding: "15px",
              border: `1px solid ${colors.secondary}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: colors.textDark,
                margin: "0 0 10px 0",
                borderBottom: `1px solid ${colors.secondary}`,
                paddingBottom: "5px",
              }}
            >
              Pack Data
            </h3>
            <div style={{ flex: 1 }}>
              {/* PieChart replaced with LineChart */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={packData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={colors.secondary}
                  />
                  <XAxis dataKey="name" stroke={colors.textLight} />
                  <YAxis stroke={colors.textLight} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.secondary}`,
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={colors.primary}
                    strokeWidth={2}
                    dot={{ fill: colors.primary, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cell Data */}
          <div
            style={{
              backgroundColor: colors.background,
              borderRadius: "8px",
              padding: "15px",
              border: `1px solid ${colors.secondary}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: colors.textDark,
                margin: "0 0 10px 0",
                borderBottom: `1px solid ${colors.secondary}`,
                paddingBottom: "5px",
              }}
            >
              Cell Data
            </h3>
            <div style={{ flex: 1 }}>
              {/* BarChart replaced with LineChart */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cellData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={colors.secondary}
                  />
                  <XAxis dataKey="name" stroke={colors.textLight} />
                  <YAxis stroke={colors.textLight} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.secondary}`,
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={colors.primary}
                    strokeWidth={2}
                    dot={{ fill: colors.primary, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Temperature Data */}
          <div
            style={{
              backgroundColor: colors.background,
              borderRadius: "8px",
              padding: "15px",
              border: `1px solid ${colors.secondary}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: colors.textDark,
                margin: "0 0 10px 0",
                borderBottom: `1px solid ${colors.secondary}`,
                paddingBottom: "5px",
              }}
            >
              Temperature Data
            </h3>
            <div style={{ flex: 1 }}>
              {/* BarChart replaced with LineChart */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temperatureData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={colors.secondary}
                  />
                  <XAxis dataKey="name" stroke={colors.textLight} />
                  <YAxis stroke={colors.textLight} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.secondary}`,
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={colors.primary}
                    strokeWidth={2}
                    dot={{ fill: colors.primary, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SOC Data */}
          <div
            style={{
              backgroundColor: colors.background,
              borderRadius: "8px",
              padding: "15px",
              border: `1px solid ${colors.secondary}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: colors.textDark,
                margin: "0 0 10px 0",
                borderBottom: `1px solid ${colors.secondary}`,
                paddingBottom: "5px",
              }}
            >
              SOC Data
            </h3>
            <div style={{ flex: 1 }}>
              {/* PieChart replaced with LineChart */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={socData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={colors.secondary}
                  />
                  <XAxis dataKey="name" stroke={colors.textLight} />
                  <YAxis stroke={colors.textLight} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.secondary}`,
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={colors.primary}
                    strokeWidth={2}
                    dot={{ fill: colors.primary, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right container - Node graphs */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {/* Node selector */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => setSelectedNode("Node0")}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  selectedNode === "Node0" ? colors.primary : colors.background,
                color: selectedNode === "Node0" ? "#fff" : colors.textDark,
                border: `1px solid ${colors.secondary}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              Node 0
            </button>
            <button
              onClick={() => setSelectedNode("Node1")}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  selectedNode === "Node1" ? colors.primary : colors.background,
                color: selectedNode === "Node1" ? "#fff" : colors.textDark,
                border: `1px solid ${colors.secondary}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              Node 1
            </button>
          </div>

          {/* Parameter selector */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => setSelectedParameter("Temperature")}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  selectedParameter === "Temperature"
                    ? colors.primary
                    : colors.background,
                color:
                  selectedParameter === "Temperature"
                    ? "#fff"
                    : colors.textDark,
                border: `1px solid ${colors.secondary}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              Temperature
            </button>
            <button
              onClick={() => setSelectedParameter("Voltage")}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  selectedParameter === "Voltage"
                    ? colors.primary
                    : colors.background,
                color:
                  selectedParameter === "Voltage" ? "#fff" : colors.textDark,
                border: `1px solid ${colors.secondary}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              Voltage
            </button>
          </div>

          {/* Main graph */}
          <div
            style={{
              flex: 1,
              backgroundColor: colors.background,
              borderRadius: "8px",
              padding: "15px",
              border: `1px solid ${colors.secondary}`,
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: colors.textDark,
                margin: "0 0 10px 0",
                borderBottom: `1px solid ${colors.secondary}`,
                paddingBottom: "5px",
              }}
            >
              {selectedNode} - {selectedParameter} Data
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={graphData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={colors.secondary}
                />
                <XAxis dataKey="time" stroke={colors.textLight} />
                <YAxis stroke={colors.textLight} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.secondary}`,
                    borderRadius: "6px",
                  }}
                />
                {selectedParameter === "Temperature"
                  ? Object.keys(nodeData.temperature).map((sensor, index) => (
                      <Line
                        key={sensor}
                        type="monotone"
                        dataKey={sensor}
                        stroke={
                          index === 0
                            ? colors.primary
                            : index === 1
                            ? colors.accentBlue
                            : index === 2
                            ? colors.accentGreen
                            : colors.highlight
                        }
                        strokeWidth={2}
                        dot={false}
                      />
                    ))
                  : Array.from({ length: 14 }).map((_, index) => (
                      <Line
                        key={`Cell ${index + 1}`}
                        type="monotone"
                        dataKey={`Cell ${index + 1}`}
                        stroke={
                          index % 4 === 0
                            ? colors.primary
                            : index % 4 === 1
                            ? colors.accentBlue
                            : index % 4 === 2
                            ? colors.accentGreen
                            : colors.highlight
                        }
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataViewer;
