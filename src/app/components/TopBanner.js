import React, { useState, useRef, useEffect } from "react";
import logo from "../../logo.svg";
import { signOut } from "aws-amplify/auth";

const TopBanner = ({
  bmsState,
  children,
  lastUpdate,
  isUpdating,
  user,
  navigate,
  timestamp, // New prop for data timestamp
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Format timestamps
  const formatTime = (date) => {
    if (!date) return "N/A";
    return date.toLocaleTimeString();
  };

  const formatDataTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Menu items for main navigation
  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "User Management", path: "/user-management" },
    { label: "Data Analytics", path: "/data-analytics" },
    { label: "ML Dashboard", path: "/ml-dashboard" },
    { label: "System Settings", path: "/system-settings" },
    { label: "Energy Monitor", path: "/energy-monitor" },
    { label: "Diagnostics", path: "/diagnostics" },
    { label: "Warranty", path: "/warranty" },
  ];

  // Check if a menu item is active
  const isActive = (path) => {
    return window.location.pathname === path;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        borderRadius: "15px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        marginBottom: "10px",
        border: "1px solid #e6e6e6",
        padding: "0",
        overflow: "hidden",
      }}
    >
      {/* Top Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          borderBottom: "1px solid #e6e6e6",
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: "80px",
            width: "80px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f5f5f9",
            borderRadius: "8px",
            marginRight: "20px",
          }}
        >
          <img
            src={logo}
            alt="Vaulta Logo"
            style={{
              height: "80%",
              width: "80%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Title and Device Info */}
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1259c3",
              margin: 0,
            }}
          >
            Battery Management Dashboard
          </h1>
          <p
            style={{
              margin: "5px 0 0 0",
              fontSize: "0.9rem",
              color: "#666",
            }}
          >
            Device: {bmsState?.DeviceId?.N || "N/A"} • TagID:{" "}
            {bmsState?.TagID || "N/A"} • Data Time:{" "}
            {formatDataTimestamp(timestamp)} • Last Update:{" "}
            {formatTime(lastUpdate)}
            {isUpdating && " (Updating...)"}
          </p>
        </div>

        {/* User Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            onClick={handleSignOut}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 20px",
              backgroundColor: "#f5f5f5",
              color: "#333",
              border: "1px solid #e0e0e0",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
              minWidth: "120px",
              fontWeight: "500",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <span style={{ marginRight: "8px" }}>⎋</span>
            Sign Out
          </button>

          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "rgba(18, 89, 195, 0.1)",
              borderRadius: "20px",
              color: "#1259c3",
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            {user?.username || "User"}
          </div>
        </div>
      </div>

      {/* Navigation and Tab Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          padding: "10px 20px",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                backgroundColor: isActive(item.path) ? "#4CAF50" : "#fff",
                color: isActive(item.path) ? "#fff" : "#333",
                border: "1px solid #e6e6e6",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "background-color 0.2s",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>{children}</div>
      </div>
    </div>
  );
};

export default TopBanner;
