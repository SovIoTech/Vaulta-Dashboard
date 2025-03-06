import React from "react";

const PackDataViewer = ({ packData }) => {
  if (!packData) {
    return (
      <p
        style={{
          fontSize: "14px",
          color: "#666", // Gray text for no data
          textAlign: "center",
        }}
      >
        No pack data available.
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
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#333", // Darker text for headings
          marginBottom: "15px",
        }}
      >
        Pack-Level Data
      </h3>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
        }}
      >
        {Object.entries(packData).map(([key, value]) => (
          <li
            key={key}
            style={{
              fontSize: "14px",
              color: "#666", // Gray text for values
              marginBottom: "10px",
            }}
          >
            <strong>{key}:</strong> {value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PackDataViewer;
