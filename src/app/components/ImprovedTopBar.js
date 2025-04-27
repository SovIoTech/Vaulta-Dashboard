// ImprovedTopBar.js
import React, { useState, useRef, useEffect } from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle.js";

const ImprovedTopBar = ({ user, bmsState, darkMode, setDarkMode }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: darkMode ? "#2c3e50" : "white",
        padding: "16px 20px",
        borderRadius: "15px",
        boxShadow: darkMode
          ? "0 2px 10px rgba(0,0,0,0.2)"
          : "0 2px 10px rgba(0,0,0,0.05)",
        marginBottom: "20px",
        border: darkMode ? "1px solid #34495e" : "1px solid #e6e6e6",
        color: darkMode ? "#ecf0f1" : "#000000",
      }}
    >
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          color: darkMode ? "#ecf0f1" : "#1259c3",
          fontFamily:
            "SamsungOne, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        Battery Management Dashboard
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Device Info */}
        <div
          style={{
            textAlign: "right",
            fontSize: "0.9rem",
            display: "none", // Hide on mobile
            "@media (min-width: 768px)": {
              display: "block",
            },
          }}
        >
          <p>Device ID: {bmsState?.DeviceId?.N || "N/A"}</p>
          <p>Serial: {bmsState?.SerialNumber?.N || "N/A"}</p>
        </div>

        {/* Dark Mode Toggle */}
        <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* User Dropdown */}
        <div className="user-menu" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="user-button"
            style={{
              background: darkMode
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(18, 89, 195, 0.1)",
              border: "none",
              color: darkMode ? "#ecf0f1" : "#1259c3",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "10px 16px",
              borderRadius: "20px",
              transition: "background 0.3s ease, transform 0.2s ease",
            }}
          >
            {user?.username || "User"} ▼
          </button>
          {isDropdownOpen && (
            <div
              className="dropdown-menu"
              style={{
                position: "absolute",
                top: "100%",
                right: "0",
                backgroundColor: darkMode ? "#34495e" : "white",
                border: darkMode ? "1px solid #2c3e50" : "1px solid #ddd",
                borderRadius: "8px",
                boxShadow: darkMode
                  ? "0 4px 8px rgba(0, 0, 0, 0.3)"
                  : "0 4px 8px rgba(0,0,0,0.1)",
                zIndex: "1000",
                minWidth: "200px",
                overflow: "hidden",
              }}
            >
              <div
                className="dropdown-item"
                style={{
                  padding: "12px 15px",
                  fontSize: "14px",
                  color: darkMode ? "#ecf0f1" : "#333",
                  borderBottom: darkMode
                    ? "1px solid #2c3e50"
                    : "1px solid #eee",
                }}
              >
                <strong>User:</strong> {user?.username}
              </div>
              <div
                className="dropdown-item"
                style={{
                  padding: "12px 15px",
                  fontSize: "14px",
                  color: darkMode ? "#ecf0f1" : "#333",
                  borderBottom: darkMode
                    ? "1px solid #2c3e50"
                    : "1px solid #eee",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/page4")}
              >
                Settings
              </div>
              <div
                className="dropdown-item"
                style={{
                  padding: "12px 15px",
                  fontSize: "14px",
                  color: darkMode ? "#ecf0f1" : "#333",
                  cursor: "pointer",
                }}
                onClick={handleSignOut}
              >
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImprovedTopBar;
