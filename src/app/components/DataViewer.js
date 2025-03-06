import React from "react";

const DataViewer = ({ loading, error, data }) => {
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

  return (
    <div
      style={{
        backgroundColor: "#fff", // White card
        borderRadius: "10px", // Rounded corners
        padding: "20px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Soft shadow
      }}
    >
      {/* Node0 Data */}
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#333", // Darker text for headings
          marginBottom: "15px",
        }}
      >
        Node0
      </h3>
      {/* Render Node0 Temperature */}
      {Object.entries(data.Node0.temperature).map(([sensor, values]) => (
        <p
          key={sensor}
          style={{
            fontSize: "14px",
            color: "#666", // Gray text for values
            marginBottom: "10px",
          }}
        >
          {sensor}: {values.join(", ")}°C
        </p>
      ))}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
        }}
      >
        {data.Node0.voltage.cellVoltages.map((voltages, index) => (
          <li
            key={index}
            style={{
              fontSize: "14px",
              color: "#666", // Gray text for values
              marginBottom: "10px",
            }}
          >
            Cell {index + 1}: {voltages.join(", ")}V
          </li>
        ))}
      </ul>

      {/* Node1 Data */}
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#333", // Darker text for headings
          marginBottom: "15px",
          marginTop: "20px",
        }}
      >
        Node1
      </h3>
      {/* Render Node1 Temperature */}
      {Object.entries(data.Node1.temperature).map(([sensor, values]) => (
        <p
          key={sensor}
          style={{
            fontSize: "14px",
            color: "#666", // Gray text for values
            marginBottom: "10px",
          }}
        >
          {sensor}: {values.join(", ")}°C
        </p>
      ))}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
        }}
      >
        {data.Node1.voltage.cellVoltages.map((voltages, index) => (
          <li
            key={index}
            style={{
              fontSize: "14px",
              color: "#666", // Gray text for values
              marginBottom: "10px",
            }}
          >
            Cell {index + 1}: {voltages.join(", ")}V
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataViewer;
