<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify"; // For popup notifications
import "react-toastify/dist/ReactToastify.css"; // CSS for notifications
import PropTypes from "prop-types"; // Add PropTypes for validation
import Sidebar from "./Sidebar.js";
=======
import React, { useEffect, useState, useRef, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
>>>>>>> 3d3dcbab18667f2bf77a3c89df0d53ce8325d3d4
import TopBanner from "./TopBanner.js";
import Cards from "./Cards.js";
import Gauges from "./Gauges.js";
import NodeTables from "./NodeTables.js";
import LoadingSpinner from "./LoadingSpinner.js";
<<<<<<< HEAD
import WeatherCard from "./WeatherCard.js"; // Import the WeatherCard component

const Dashboard = ({ bmsData, signOut }) => {
  const [bmsState, setBmsState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("cards"); // Track active tab

=======
import WeatherCard from "./WeatherCard.js";
import BatteryMetricsCarousel from "./BatteryMetricsCarousel.js";
import AWS from "aws-sdk";
import { fetchAuthSession } from "aws-amplify/auth";
import awsconfig from "../../aws-exports.js";
import { getLastMinuteData } from "../../queries.js";
import { useNavigate } from "react-router-dom";

const Dashboard = ({ bmsData, signOut }) => {
  const [bmsState, setBmsState] = useState(null);
  const [activeTab, setActiveTab] = useState("cards");
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Refs for tracking components
  const batteryStatusRef = useRef(null);
  const batteryPerformanceRef = useRef(null);
  const weatherRef = useRef(null);
  const systemMetricsRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Function to fetch the latest data
  const fetchLatestData = useCallback(async () => {
    try {
      setIsUpdating(true);

      // Get the AWS credentials
      const session = await fetchAuthSession();
      const credentials = session.credentials;

      // Initialize DynamoDB client
      const dynamoDB = new AWS.DynamoDB({
        apiVersion: "2012-08-10",
        region: awsconfig.region,
        credentials,
      });

      // Fetch the latest data
      const latestData = await getLastMinuteData(
        dynamoDB,
        "CAN_BMS_Data",
        "BAT-0x440"
      );

      if (latestData && latestData.length > 0) {
        setBmsState(latestData[0]);
        setLastUpdateTime(new Date());
      } else {
        console.warn("No new data available");
      }
    } catch (error) {
      console.error("Error fetching latest data:", error);
      toast.error("Failed to update latest data.", {
        autoClose: 3000,
        toastId: "update-error",
      });
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Set initial data from props
>>>>>>> 3d3dcbab18667f2bf77a3c89df0d53ce8325d3d4
  useEffect(() => {
    console.log("bmsData:", bmsData);
    if (
      bmsData &&
      bmsData.lastMinuteData &&
      bmsData.lastMinuteData.length > 0
    ) {
      console.log("Setting bmsState:", bmsData.lastMinuteData[0]);
      setBmsState(bmsData.lastMinuteData[0]);
    } else {
      console.error("bmsData is not in the expected format or is empty.");
      toast.error(
        "Backend returned null data. Displaying placeholder values.",
        {
          autoClose: 5000, // Popup disappears after 5 seconds
          toastId: "null-data-warning", // Unique ID to prevent duplicate toasts
        }
      );
      setBmsState({}); // Set bmsState to an empty object to avoid crashes
    }
  }, [bmsData]);

  const roundValue = (value) => parseFloat(value).toFixed(2);

  const nodeData = [
    {
      node: "Node 00",
      data: {
        balanceStatus: roundValue(bmsState?.Node00BalanceStatus?.N || "NaN"),
        totalVoltage: roundValue(bmsState?.Node00TotalVoltage?.N || "NaN"),
        cellVoltages: Array.from({ length: 14 }, (_, i) =>
          roundValue(
            bmsState?.[`Node00Cell${i < 10 ? `0${i}` : i}`]?.N || "NaN"
          )
        ),
        temperatures: Array.from({ length: 6 }, (_, i) =>
          roundValue(
            bmsState?.[`Node00Temp${i < 10 ? `0${i}` : i}`]?.N || "NaN"
          )
        ),
        tempCount: roundValue(bmsState?.Node00TempCount?.N || "NaN"),
      },
    },
    {
      node: "Node 01",
      data: {
        balanceStatus: roundValue(bmsState?.Node01BalanceStatus?.N || "NaN"),
        totalVoltage: roundValue(bmsState?.Node01TotalVoltage?.N || "NaN"),
        cellVoltages: Array.from({ length: 14 }, (_, i) =>
          roundValue(
            bmsState?.[`Node01Cell${i < 10 ? `0${i}` : i}`]?.N || "NaN"
          )
        ),
        temperatures: Array.from({ length: 6 }, (_, i) =>
          roundValue(
            bmsState?.[`Node01Temp${i < 10 ? `0${i}` : i}`]?.N || "NaN"
          )
        ),
        tempCount: roundValue(bmsState?.Node01TempCount?.N || "NaN"),
      },
    },
  ];

  if (!bmsState) {
    return <LoadingSpinner />;
  }

<<<<<<< HEAD
=======
  // Define colors for consistent styling
  const colors = {
    primary: "#818181", // Base gray
    secondary: "#c0c0c0", // Light gray
    accentGreen: "#4CAF50", // Vibrant green
    accentRed: "#F44336", // Strategic red
    accentBlue: "#2196F3", // Complementary blue
    background: "rgba(192, 192, 192, 0.1)",
    textDark: "#333333",
    textLight: "#555555",
    highlight: "#FFC107", // Accent yellow
  };

  // Tab navigation component
  const TabNavigation = () => (
    <div style={{ display: "flex", gap: "10px" }}>
      <button
        onClick={() => setActiveTab("cards")}
        style={{
          margin: "0 5px",
          padding: "8px 16px",
          backgroundColor: activeTab === "cards" ? "#4CAF50" : "#ffffff", // Changed to green for active tab
          color: activeTab === "cards" ? "#fff" : colors.textDark,
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "600",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          fontSize: "0.85rem",
        }}
      >
        System Overview
      </button>
      <button
        onClick={() => setActiveTab("tables")}
        style={{
          margin: "0 5px",
          padding: "8px 16px",
          backgroundColor: activeTab === "tables" ? "#4CAF50" : "#ffffff", // Changed to green for active tab
          color: activeTab === "tables" ? "#fff" : colors.textDark,
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "600",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          fontSize: "0.85rem",
        }}
      >
        Detailed Data
      </button>
      {/* Manual refresh button */}
      <button
        onClick={fetchLatestData}
        disabled={isUpdating}
        style={{
          margin: "0 5px",
          padding: "8px 16px",
          backgroundColor: isUpdating ? "#cccccc" : "#ffffff",
          color: colors.textDark,
          border: "none",
          borderRadius: "5px",
          cursor: isUpdating ? "not-allowed" : "pointer",
          fontWeight: "600",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        {isUpdating ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                border: "2px solid #333",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginRight: "6px",
              }}
            ></span>
            Updating...
          </>
        ) : (
          "Refresh Data"
        )}
      </button>
    </div>
  );

>>>>>>> 3d3dcbab18667f2bf77a3c89df0d53ce8325d3d4
  return (
    <div
      style={{
        display: "flex",
<<<<<<< HEAD
        minHeight: "100vh",
        backgroundColor: "#f2f2f2", // OneUI light background color
        fontFamily:
          "SamsungOne, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <ToastContainer /> {/* For displaying popup notifications */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        signOut={signOut}
      />
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#f2f2f2", // OneUI light background color
          maxWidth: "calc(100% - 80px)",
          overflow: "auto", // Allow vertical scrolling if needed
        }}
      >
        <TopBanner bmsState={bmsState} />

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={() => setActiveTab("cards")}
            style={{
              margin: "0 10px",
              padding: "10px 20px",
              backgroundColor: activeTab === "cards" ? "#1259c3" : "#ffffff",
              color: activeTab === "cards" ? "#fff" : "#000000",
              border: "none",
              borderRadius: "25px", // Rounded corners for OneUI
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab("tables")}
            style={{
              margin: "0 10px",
              padding: "10px 20px",
              backgroundColor: activeTab === "tables" ? "#1259c3" : "#ffffff",
              color: activeTab === "tables" ? "#fff" : "#000000",
              border: "none",
              borderRadius: "25px", // Rounded corners for OneUI
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Detailed Data
          </button>
        </div>

        {/* Tab Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {activeTab === "cards" ? (
            <>
              {/* Cards Section */}
              <div
                style={{
                  backgroundColor: "#fff", // White background for cards
                  borderRadius: "15px", // Rounded corners for OneUI
                  padding: "20px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  marginBottom: "20px",
                  width: "100%",
                }}
              >
                <h2
                  style={{
                    color: "#1259c3",
                    marginBottom: "15px",
                    fontWeight: "600",
                    fontSize: "1.5rem",
                  }}
                >
                  Battery Status
                </h2>
                <Cards bmsState={bmsState} roundValue={roundValue} />
              </div>

              {/* Gauges Section */}
              <div
                style={{
                  backgroundColor: "#fff", // White background for gauges
                  borderRadius: "15px", // Rounded corners for OneUI
                  padding: "20px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  width: "100%",
                }}
              >
                <h2
                  style={{
                    color: "#1259c3",
                    marginBottom: "15px",
                    fontWeight: "600",
                    fontSize: "1.5rem",
                  }}
                >
                  System Metrics
                </h2>
                {/* Weather Card and Gauges */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px", // Reduced gap between items
                    justifyContent: "space-between", // Align items properly
                    width: "100%", // Ensure the container takes full width
                  }}
                >
                  {/* WeatherCard with fixed width */}
                  <div style={{ flex: "1 1 300px", maxWidth: "300px" }}>
                    <WeatherCard city="Sydney" />
                  </div>

                  {/* Gauges with flexible width */}
                  <div
                    style={{
                      flex: "2 1 600px",
                      maxWidth: "calc(100% - 320px)",
                    }}
                  >
                    <Gauges bmsState={bmsState} roundValue={roundValue} />
                  </div>
=======
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#f2f2f2",
        fontFamily: "Arial, sans-serif",
        padding: "10px",
      }}
    >
      <ToastContainer />

      {/* Updated Top Banner with navigation */}
      <TopBanner
        user={{ username: bmsData?.userDetails?.identityId || "User" }}
        bmsState={bmsState}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lastUpdate={lastUpdateTime}
        isUpdating={isUpdating}
      >
        <TabNavigation />
      </TopBanner>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {activeTab === "cards" ? (
          <>
            {/* Left Section - Combined Battery Status and Performance */}
            <div
              ref={batteryStatusRef}
              style={{
                display: "flex",
                flexDirection: "column",
                width: "30%",
                minWidth: "300px",
                marginRight: "10px",
                gap: "10px",
              }}
            >
              {/* Battery Status Section */}
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "15px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  border: `1px solid ${colors.secondary}`,
                }}
              >
                <h2
                  style={{
                    color: colors.textDark,
                    marginBottom: "15px",
                    fontWeight: "600",
                    fontSize: "1.2rem",
                    borderBottom: `1px solid ${colors.secondary}`,
                    paddingBottom: "5px",
                  }}
                >
                  Battery Status
                </h2>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <Cards
                    bmsState={bmsState}
                    roundValue={roundValue}
                    containerRef={batteryStatusRef}
                    colors={colors}
                  />
>>>>>>> 3d3dcbab18667f2bf77a3c89df0d53ce8325d3d4
                </div>
              </div>

              {/* Battery Performance Section */}
              <div
                ref={batteryPerformanceRef}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "15px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  border: `1px solid ${colors.secondary}`,
                }}
              >
                <h2
                  style={{
                    color: colors.textDark,
                    marginBottom: "15px",
                    fontWeight: "600",
                    fontSize: "1.2rem",
                    borderBottom: `1px solid ${colors.secondary}`,
                    paddingBottom: "5px",
                  }}
                >
                  Battery Performance
                </h2>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <Gauges
                    bmsState={bmsState}
                    roundValue={roundValue}
                    containerRef={batteryPerformanceRef}
                    colors={colors}
                  />
                </div>
              </div>
            </div>

            {/* Right Section - Weather and System Metrics */}
            <div
              style={{
<<<<<<< HEAD
                backgroundColor: "#fff", // White background for tables
                borderRadius: "15px", // Rounded corners for OneUI
                padding: "20px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                width: "100%",
=======
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                gap: "10px",
>>>>>>> 3d3dcbab18667f2bf77a3c89df0d53ce8325d3d4
              }}
            >
              <div
                style={{
<<<<<<< HEAD
                  color: "#1259c3",
                  marginBottom: "15px",
                  fontWeight: "600",
                  fontSize: "1.5rem",
                }}
              >
                Cell & Temperature Data
              </h2>
              <NodeTables nodeData={nodeData} />
=======
                  display: "flex",
                  flex: 1,
                  gap: "10px",
                  minHeight: 0,
                }}
              >
                {/* Weather Card */}
                <div
                  ref={weatherRef}
                  style={{
                    flex: 0.35,
                    minWidth: 0,
                    minHeight: 0,
                  }}
                >
                  <WeatherCard city="Brisbane" containerRef={weatherRef} />
                </div>

                {/* System Metrics */}
                <div
                  ref={systemMetricsRef}
                  style={{
                    flex: 0.65,
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    padding: "15px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    border: `1px solid ${colors.secondary}`,
                  }}
                >
                  <h2
                    style={{
                      color: colors.textDark,
                      marginBottom: "15px",
                      fontWeight: "600",
                      fontSize: "1.2rem",
                      borderBottom: `1px solid ${colors.secondary}`,
                      paddingBottom: "5px",
                    }}
                  >
                    System Metrics
                  </h2>
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <BatteryMetricsCarousel
                      bmsState={bmsState}
                      roundValue={roundValue}
                      containerRef={systemMetricsRef}
                      colors={colors}
                    />
                  </div>
                </div>
              </div>
>>>>>>> 3d3dcbab18667f2bf77a3c89df0d53ce8325d3d4
            </div>
          </>
        ) : (
          /* Tables Section */
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              flex: 1,
              overflow: "hidden",
              border: `1px solid ${colors.secondary}`,
            }}
          >
            <h2
              style={{
                color: colors.textDark,
                marginBottom: "15px",
                fontWeight: "600",
                fontSize: "1.2rem",
                borderBottom: `1px solid ${colors.secondary}`,
                paddingBottom: "5px",
              }}
            >
              Cell & Temperature Data
            </h2>
            <NodeTables nodeData={nodeData} colors={colors} />
          </div>
        )}
      </div>
    </div>
  );
};

// Add PropTypes for validation
Dashboard.propTypes = {
  bmsData: PropTypes.object,
  signOut: PropTypes.func,
};

export default Dashboard;
