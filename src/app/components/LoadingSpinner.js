// components/LoadingSpinner.js
"use client";
import React from "react";

const LoadingSpinner = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent background
      }}
    >
      <div
        style={{
          border: "4px solid rgba(128, 0, 128, 0.3)", // Purple border
          borderTop: "4px solid orange", // Orange top border
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite",
        }}
      ></div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;
