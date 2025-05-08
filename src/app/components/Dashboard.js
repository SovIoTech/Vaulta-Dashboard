import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
import Sidebar from "./Sidebar.js";
import TopBanner from "./TopBanner.js";
import Cards from "./Cards.js";
import NodeTables from "./NodeTables.js";
import Gauges from "./Gauges.js"
import LoadingSpinner from "./LoadingSpinner.js";
import WeatherCard from "./WeatherCard.js";
import BatteryMetricsCarousel from "./BatteryMetricsCarousel.js";
import { useResizeObserver } from '@react-aria/utils';

const Dashboard = ({ bmsData, signOut }) => {
  const [bmsState, setBmsState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("cards");

  // Create refs for the main containers
  const batteryStatusRef = useRef(null);
  const batteryPerformanceRef = useRef(null);
  const weatherRef = useRef(null);
  const systemMetricsRef = useRef(null);

  useEffect(() => {
    console.log("bmsData:", bmsData);
    if (bmsData && bmsData.lastMinuteData && bmsData.lastMinuteData.length > 0) {
      console.log("Setting bmsState:", bmsData.lastMinuteData[0]);
      setBmsState(bmsData.lastMinuteData[0]);
    } else {
      console.error("bmsData is not in the expected format or is empty.");
      toast.error("Backend returned null data. Displaying placeholder values.", {
        autoClose: 5000,
        toastId: "null-data-warning",
      });
      setBmsState({});
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
          roundValue(bmsState?.[`Node00Cell${i < 10 ? `0${i}` : i}`]?.N || "NaN")
        ),
        temperatures: Array.from({ length: 6 }, (_, i) =>
          roundValue(bmsState?.[`Node00Temp${i < 10 ? `0${i}` : i}`]?.N || "NaN")
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
          roundValue(bmsState?.[`Node01Cell${i < 10 ? `0${i}` : i}`]?.N || "NaN")
        ),
        temperatures: Array.from({ length: 6 }, (_, i) =>
          roundValue(bmsState?.[`Node01Temp${i < 10 ? `0${i}` : i}`]?.N || "NaN")
        ),
        tempCount: roundValue(bmsState?.Node01TempCount?.N || "NaN"),
      },
    },
  ];

  if (!bmsState) {
    return <LoadingSpinner />;
  }

  // Define colors from WeatherCard for consistent styling
  const colors = {
    primary: '#818181',       // Base gray
    secondary: '#c0c0c0',     // Light gray
    accentGreen: '#4CAF50',   // Vibrant green
    accentRed: '#F44336',     // Strategic red
    accentBlue: '#2196F3',    // Complementary blue
    background: 'rgba(192, 192, 192, 0.1)',
    textDark: '#333333',
    textLight: '#555555',
    highlight: '#FFC107'      // Accent yellow
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#f2f2f2",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <ToastContainer />
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        signOut={signOut}
      />
      <div
        style={{
          flex: 1,
          padding: "10px",
          maxWidth: "calc(100% - 80px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top Banner - Now includes tab navigation */}
        <div style={{ marginBottom: "10px" }}>
          <TopBanner bmsState={bmsState}>
            {/* Tab Navigation inside the TopBanner */}
            <div
              style={{
                display: "flex",
                marginLeft: "20px",
              }}
            >
              <button
                onClick={() => setActiveTab("cards")}
                style={{
                  margin: "0 5px",
                  padding: "8px 16px",
                  backgroundColor: activeTab === "cards" ? colors.accentGreen : "#ffffff",
                  color: activeTab === "cards" ? "#fff" : colors.textDark,
                  border: "none",
                  borderRadius: "2px",
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
                  backgroundColor: activeTab === "tables" ? colors.accentGreen : "#ffffff",
                  color: activeTab === "tables" ? "#fff" : colors.textDark,
                  border: "none",
                  borderRadius: "2px",
                  cursor: "pointer",
                  fontWeight: "600",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  fontSize: "0.85rem",
                }}
              >
                Detailed Data
              </button>
            </div>
          </TopBanner>
        </div>

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
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                gap: "10px",
              }}>
                <div style={{
                  display: "flex",
                  flex: 1,
                  gap: "10px",
                  minHeight: 0,
                }}>
                  {/* Weather Card */}
                  <div 
                    ref={weatherRef}
                    style={{ 
                      flex: 0.35,
                      minWidth: 0,
                      minHeight: 0,
                    }}
                  >
                    <WeatherCard 
                      city="Brisbane" 
                      containerRef={weatherRef}
                    />
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
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  bmsData: PropTypes.object,
  signOut: PropTypes.func.isRequired,
};

export default Dashboard;