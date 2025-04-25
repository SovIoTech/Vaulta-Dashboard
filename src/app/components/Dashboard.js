import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
import Sidebar from "./Sidebar.js";
import TopBanner from "./TopBanner.js";
import Cards from "./Cards.js";
import Gauges from "./Gauges.js";
import NodeTables from "./NodeTables.js";
import LoadingSpinner from "./LoadingSpinner.js";
import WeatherCard from "./WeatherCard.js";
import BatteryMetricsCarousel from "./BatteryMetricsCarousel.js";

const Dashboard = ({ bmsData, signOut }) => {
  const [bmsState, setBmsState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("cards");

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
        <TopBanner bmsState={bmsState} />

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginBottom: "10px",
            marginTop: "10px",
          }}
        >
          <button
            onClick={() => setActiveTab("cards")}
            style={{
              margin: "0 5px",
              padding: "8px 16px",
              backgroundColor: activeTab === "cards" ? "#8BC34A" : "#ffffff",
              color: activeTab === "cards" ? "#fff" : "#333333",
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
              backgroundColor: activeTab === "tables" ? "#8BC34A" : "#ffffff",
              color: activeTab === "tables" ? "#fff" : "#333333",
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
              {/* Left Section - Combined Battery Status and Battery Performance (30% width) */}
              <div
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
                    borderRadius: "4px",
                    padding: "15px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                    flex: 1,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h2
                    style={{
                      color: "#333",
                      marginBottom: "15px",
                      fontWeight: "600",
                      fontSize: "1.2rem",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                    }}
                  >
                    Battery Status
                  </h2>
                  <Cards bmsState={bmsState} roundValue={roundValue} />
                  
                  {/* Battery Performance Section */}
                  <div style={{ marginTop: "15px", flex: 1 }}>
                    <h2
                      style={{
                        color: "#333",
                        marginBottom: "15px",
                        fontWeight: "600",
                        fontSize: "1.2rem",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "5px",
                      }}
                    >
                      Battery Performance
                    </h2>
                    <div style={{ flex: 1 }}>
                      <Gauges 
                        bmsState={bmsState} 
                        roundValue={roundValue}
                        containerStyle={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Main Content (70% width) */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minWidth: "0",
                  gap: "10px",
                }}
              >
                {/* Top Row - Weather Card and System Metrics */}
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    gap: "10px",
                    minHeight: 0,
                  }}
                >
                  {/* Weather Card - reduced width */}
                  <div style={{ 
                    flex: 0.35,  // Reduced width (35% of right section)
                    minWidth: 0,
                  }}>
                    <WeatherCard city="Brisbane" />
                  </div>

                  {/* System Metrics Section */}
                  <div
                    style={{
                      flex: 0.65,  // Takes remaining space (65% of right section)
                      backgroundColor: "#fff",
                      borderRadius: "4px",
                      padding: "15px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 0,
                    }}
                  >
                    <h2
                      style={{
                        color: "#333",
                        marginBottom: "15px",
                        fontWeight: "600",
                        fontSize: "1.2rem",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "5px",
                      }}
                    >
                      System Metrics
                    </h2>
                    <div style={{ 
                      flex: 1,
                      minHeight: 0,
                    }}>
                      <BatteryMetricsCarousel bmsState={bmsState} roundValue={roundValue} />
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
                borderRadius: "4px",
                padding: "15px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                flex: 1,
                overflow: "hidden",
              }}
            >
              <h2
                style={{
                  color: "#333",
                  marginBottom: "15px",
                  fontWeight: "600",
                  fontSize: "1.2rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "5px",
                }}
              >
                Cell & Temperature Data
              </h2>
              <NodeTables nodeData={nodeData} />
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