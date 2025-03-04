// components/TopBanner.js
"use client";
import React from "react";

const TopBanner = ({ bmsState }) => {
  return (
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
    </div>
  );
};

export default TopBanner;
