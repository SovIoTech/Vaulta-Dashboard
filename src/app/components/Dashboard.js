import React, { useEffect, useState, useRef, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
import TopBanner from "./TopBanner.js";
import Cards from "./Cards.js";
import Gauges from "./Gauges.js";
import NodeTables from "./NodeTables.js";
import LoadingSpinner from "./LoadingSpinner.js";
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
  useEffect(() => {
    console.log("bmsData:", bmsData);
    if (
      bmsData &&
      bmsData.lastMinuteData &&
      bmsData.lastMinuteData.length > 0
    ) {
      console.log("Setting bmsState:", bmsData.lastMinuteData[0]);
      setBmsState(bmsData.lastMinuteData[0]);
      setLastUpdateTime(new Date());
    } else {
      console.error("bmsData is not in the expected format or is empty.");
      toast.error(
        "Backend returned null data. Displaying placeholder values.",
        {
          autoClose: 5000,
          toastId: "null-data-warning",
        }
      );
      setBmsState({});
    }
  }, [bmsData]);

  useEffect(() => {
    // If no bmsData is received or if bmsState is still null after initial load
    if (!bmsState) {
      // Create a fallback bmsState with all necessary properties
      // This is just for testing purposes and should be removed in production
      const fallbackBmsState = {
        DeviceId: { N: "TEST-DEVICE" },
        SerialNumber: { N: "12345678" },
        TagID: { S: "BAT-0x440" },
        SOCPercent: { N: "85" },
        SOCAh: { N: "120" },
        TotalBattVoltage: { N: "48.2" },
        TotalLoadVoltage: { N: "48.0" },
        TotalCurrent: { N: "5.2" },
        Carbon_Offset_kg: { N: "128.5" },
        MaxCellTemp: { N: "36" },
        MinCellTemp: { N: "32" },
        MaxCellTempNode: { N: "0" },
        MinCellTempNode: { N: "1" },
        MaximumCellVoltage: { N: "3.95" },
        MinimumCellVoltage: { N: "3.85" },
        MaximumCellVoltageCellNo: { N: "5" },
        MinimumCellVoltageCellNo: { N: "12" },
        MaximumCellVoltageNode: { N: "0" },
        MinimumCellVoltageNode: { N: "1" },
        // Node 00 data
        Node00BalanceStatus: { N: "1" },
        Node00TotalVoltage: { N: "24.1" },
        Node00TempCount: { N: "6" },
      };

      // Add cell voltages for Node00
      for (let i = 0; i < 14; i++) {
        const cellKey = `Node00Cell${i < 10 ? `0${i}` : i}`;
        fallbackBmsState[cellKey] = {
          N: (3.85 + Math.random() * 0.1).toFixed(2),
        };
      }

      // Add temperatures for Node00
      for (let i = 0; i < 6; i++) {
        const tempKey = `Node00Temp${i < 10 ? `0${i}` : i}`;
        fallbackBmsState[tempKey] = { N: (32 + Math.random() * 4).toFixed(1) };
      }

      // Node 01 data
      fallbackBmsState.Node01BalanceStatus = { N: "1" };
      fallbackBmsState.Node01TotalVoltage = { N: "24.1" };
      fallbackBmsState.Node01TempCount = { N: "6" };

      // Add cell voltages for Node01
      for (let i = 0; i < 14; i++) {
        const cellKey = `Node01Cell${i < 10 ? `0${i}` : i}`;
        fallbackBmsState[cellKey] = {
          N: (3.85 + Math.random() * 0.1).toFixed(2),
        };
      }

      // Add temperatures for Node01
      for (let i = 0; i < 6; i++) {
        const tempKey = `Node01Temp${i < 10 ? `0${i}` : i}`;
        fallbackBmsState[tempKey] = { N: (32 + Math.random() * 4).toFixed(1) };
      }

      console.log("Using fallback bmsState for testing");
      setBmsState(fallbackBmsState);
      setLastUpdateTime(new Date());
    }
  }, [bmsState]); // Only run when bmsState changes or is null

  // Set up auto-refresh interval
  useEffect(() => {
    // Start the interval
    refreshIntervalRef.current = setInterval(() => {
      fetchLatestData();
    }, 20000); // 20 seconds

    // Cleanup function to clear the interval when component unmounts
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchLatestData]);

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

  return (
    <div
      style={{
        display: "flex",
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
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                gap: "10px",
              }}
            >
              <div
                style={{
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

      {/* Add a keyframe animation for the spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

Dashboard.propTypes = {
  bmsData: PropTypes.object,
  signOut: PropTypes.func,
};

export default Dashboard;
