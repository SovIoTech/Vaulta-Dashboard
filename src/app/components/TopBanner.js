import React from "react";
import logo from "../../logo.svg"; // Import the Vaulta logo

const TopBanner = ({ bmsState, children, lastUpdate, isUpdating }) => {
  // Format the lastUpdate timestamp
  const formatTime = (date) => {
    if (!date) return "N/A";

    // Format: HH:MM:SS
    return date.toLocaleTimeString();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        padding: "16px 20px",
        borderRadius: "15px", // Rounded corners for OneUI
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        marginBottom: "20px",
        border: "1px solid #e6e6e6",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={logo}
          alt="Vaulta Logo"
          style={{
            height: "50px", // Increased logo size
            marginRight: "18px", // Increased margin
          }}
        />
        <h1
          style={{
            fontSize: "1.7rem", // Increased font size
            fontWeight: "600",
            color: "#1259c3", // OneUI primary blue
            fontFamily:
              "SamsungOne, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            margin: 0,
          }}
        >
          Battery Management Dashboard
        </h1>
        {/* Render additional children (like tab buttons) */}
        {children}
      </div>
      <div
        style={{
          textAlign: "right",
          color: "#000000", // OneUI text color
          fontSize: "1rem", // Slightly increased font size
        }}
      >
        <p>Device ID: {bmsState.DeviceId?.N || "N/A"}</p>
        <p>Serial Number: {bmsState.SerialNumber?.N || "N/A"}</p>
        <p>Tag ID: {bmsState.TagID?.S || "N/A"}</p>
        <p
          style={{
            color: isUpdating ? "#FF9800" : "#4CAF50",
            fontWeight: "500",
          }}
        >
          Last Updated: {formatTime(lastUpdate)}
          {isUpdating && " (Updating...)"}
        </p>
      </div>
    </div>
  );
};

export default TopBanner;
