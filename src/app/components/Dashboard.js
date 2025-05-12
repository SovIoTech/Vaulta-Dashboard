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

  // Get the BAT-0x440 data from the bmsData prop
  const batteryData = bmsData?.["BAT-0x440"] || {};
  const { latest, lastMinute = [], lastHour = [], lastDay = [] } = batteryData;

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
    if (latest) {
      console.log("Setting bmsState from latest data:", latest);
      setBmsState(latest);
    } else if (lastMinute && lastMinute.length > 0) {
      console.log("Setting bmsState from lastMinute data:", lastMinute[0]);
      setBmsState(lastMinute[0]);
    } else {
      console.error("No valid data available for BAT-0x440");
      toast.error(
        "Backend returned null data. Displaying placeholder values.",
        {
          autoClose: 5000,
          toastId: "null-data-warning",
        }
      );
      setBmsState({}); // Set bmsState to an empty object to avoid crashes
    }
  }, [latest, lastMinute]);

  const roundValue = (value) => {
    if (value === undefined || value === null) return "NaN";
    return parseFloat(value).toFixed(2);
  };

  const nodeData = [
    {
      node: "Node 00",
      data: {
        balanceStatus: roundValue(bmsState?.Node00BalanceStatus),
        totalVoltage: roundValue(bmsState?.Node00TotalVoltage),
        cellVoltages: Array.from({ length: 14 }, (_, i) =>
          roundValue(bmsState?.[`Node00Cell${i < 10 ? `0${i}` : i}`])
        ),
        temperatures: Array.from({ length: 6 }, (_, i) =>
          roundValue(bmsState?.[`Node00Temp${i < 10 ? `0${i}` : i}`])
        ),
        tempCount: roundValue(bmsState?.Node00TempCount),
      },
    },
    {
      node: "Node 01",
      data: {
        balanceStatus: roundValue(bmsState?.Node01BalanceStatus),
        totalVoltage: roundValue(bmsState?.Node01TotalVoltage),
        cellVoltages: Array.from({ length: 14 }, (_, i) =>
          roundValue(bmsState?.[`Node01Cell${i < 10 ? `0${i}` : i}`])
        ),
        temperatures: Array.from({ length: 6 }, (_, i) =>
          roundValue(bmsState?.[`Node01Temp${i < 10 ? `0${i}` : i}`])
        ),
        tempCount: roundValue(bmsState?.Node01TempCount),
      },
    },
  ];

  if (!bmsState) {
    return <LoadingSpinner />;
  }

  // Define colors for consistent styling
  const colors = {
    primary: "#818181",
    secondary: "#c0c0c0",
    accentGreen: "#4CAF50",
    accentRed: "#F44336",
    accentBlue: "#2196F3",
    background: "rgba(192, 192, 192, 0.1)",
    textDark: "#333333",
    textLight: "#555555",
    highlight: "#FFC107",
  };

  // Tab navigation component
  const TabNavigation = () => (
    <div style={{ display: "flex", gap: "10px" }}>
      <button
        onClick={() => setActiveTab("cards")}
        style={{
          margin: "0 5px",
          padding: "8px 16px",
          backgroundColor: activeTab === "cards" ? "#4CAF50" : "#ffffff",
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
          backgroundColor: activeTab === "tables" ? "#4CAF50" : "#ffffff",
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

      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {activeTab === "cards" ? (
          <>
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

Dashboard.propTypes = {
  bmsData: PropTypes.shape({
    "BAT-0x440": PropTypes.shape({
      latest: PropTypes.object,
      lastMinute: PropTypes.array,
      lastHour: PropTypes.array,
      lastDay: PropTypes.array,
    }),
    userDetails: PropTypes.shape({
      identityId: PropTypes.string,
    }),
  }),
  signOut: PropTypes.func,
};

export default Dashboard;
