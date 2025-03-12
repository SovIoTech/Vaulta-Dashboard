import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Function to generate different colors for multiple lines
const generateColor = (index) => {
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ff7300",
    "#0088FE",
    "#FF1493",
    "#32CD32",
    "#FFD700",
  ];
  return colors[index % colors.length];
};

const LineChartVoltage = ({ data }) => {
  if (!data || data.length === 0) return <p>No data available</p>;

  // Extract keys dynamically (excluding "time")
  const keys = Object.keys(data[0]).filter((key) => key !== "time");

  return (
    <div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis
            label={{
              value: "Value",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 14, fill: "#555" },
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip contentStyle={{ backgroundColor: "#222", color: "#fff" }} />

          {keys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={generateColor(index)}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartVoltage;
