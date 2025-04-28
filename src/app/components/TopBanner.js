import React, { useState, useRef, useEffect } from "react";
import logo from "../../logo.svg";
import { useNavigate, useLocation } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle.js";
import { signOut } from "aws-amplify/auth";

const TopBanner = ({
  bmsState,
  children,
  lastUpdate,
  isUpdating,
  user,
  darkMode,
  setDarkMode,
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Format the lastUpdate timestamp
  const formatTime = (date) => {
    if (!date) return "N/A";
    return date.toLocaleTimeString();
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

  // Menu items from sidebar - now in topbar
  const menuItems = [
    {
      icon: "",
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: "",
      label: "User Management",
      path: "/page2",
    },
    {
      icon: "",
      label: "Data Analytics",
      path: "/page3",
    },
    {
      icon: "",
      label: "ML Dashboard",
      path: "/ml-dashboard",
    },
    {
      icon: "",
      label: "System Settings",
      path: "/page4",
    },
    {
      icon: "",
      label: "Energy Monitor",
      path: "/page5",
    },
  ];

  // Check if a menu item is active based on current location path
  const isActive = (path) => {
    return location.pathname === path;
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
      {/* Top Section: Logo, Title, and User Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          borderBottom: "1px solid #e6e6e6",
        }}
      >
        {/* Logo Square - now larger */}
        <div
          style={{
            height: "80px", // Increased from 60px
            width: "80px", // Increased from 60px
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

        {/* Title - moved to top */}
        <div
          style={{
            flex: 1,
          }}
        >
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
            {bmsState?.TagID?.S || "N/A"}
          </p>
        </div>

        {/* User Dropdown and Dark Mode Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          {setDarkMode && (
            <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          )}

          <div
            className="user-menu"
            ref={dropdownRef}
            style={{ position: "relative" }}
          >
            <button
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              style={{
                background: "rgba(18, 89, 195, 0.1)",
                border: "none",
                color: "#1259c3",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "8px 16px",
                borderRadius: "20px",
                transition: "background 0.3s ease, transform 0.2s ease",
                position: "relative", // Add position relative
                zIndex: "1", // Ensure the button stays on top
              }}
            >
              {user?.username || "User"} ▼
            </button>

            {isDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: "0",
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  zIndex: "1000",
                  minWidth: "200px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 15px",
                    fontSize: "14px",
                    color: "#333",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>User:</strong> {user?.username || "User"}
                </div>
                <div
                  style={{
                    padding: "12px 15px",
                    fontSize: "14px",
                    color: "#333",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>Device ID:</strong> {bmsState?.DeviceId?.N || "N/A"}
                </div>
                <div
                  style={{
                    padding: "12px 15px",
                    fontSize: "14px",
                    color: "#333",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>Serial Number:</strong>{" "}
                  {bmsState?.SerialNumber?.N || "N/A"}
                </div>
                <div
                  style={{
                    padding: "12px 15px",
                    fontSize: "14px",
                    color: "#333",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>Tag ID:</strong> {bmsState?.TagID?.S || "N/A"}
                </div>
                <div
                  style={{
                    padding: "12px 15px",
                    fontSize: "14px",
                    color: "#333",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>Last Updated:</strong>{" "}
                  <span style={{ color: isUpdating ? "#FF9800" : "#4CAF50" }}>
                    {formatTime(lastUpdate)} {isUpdating && "(Updating...)"}
                  </span>
                </div>
                <div
                  style={{
                    padding: "12px 15px",
                    fontSize: "14px",
                    color: "#333",
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

      {/* Bottom Section: Navigation Menu and Tab Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          padding: "10px 20px",
        }}
      >
        {/* Left: Navigation Menu - now horizontal */}
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                backgroundColor: isActive(item.path) ? "#4CAF50" : "#fff", // Green for active tab
                color: isActive(item.path) ? "#fff" : "#333",
                border: "1px solid #e6e6e6",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "background-color 0.2s",
              }}
            >
              <span style={{ marginRight: "8px", fontSize: "1rem" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Right: Tab Controls - moved to left bottom */}
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
