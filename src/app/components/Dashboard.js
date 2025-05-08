import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify"; // For popup notifications
import "react-toastify/dist/ReactToastify.css"; // CSS for notifications
import PropTypes from "prop-types"; // Add PropTypes for validation
import Sidebar from "./Sidebar.js";
import TopBanner from "./TopBanner.js";
import Cards from "./Cards.js";
import Gauges from "./Gauges.js";
import NodeTables from "./NodeTables.js";
import LoadingSpinner from "./LoadingSpinner.js";
import WeatherCard from "./WeatherCard.js"; // Import the WeatherCard component

const Dashboard = ({ bmsData, signOut }) => {
  const [bmsState, setBmsState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("cards"); // Track active tab

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

  return (
    <div
      style={{
        display: "flex",
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
                </div>
              </div>
            </>
          ) : (
            /* Tables Section */
            <div
              style={{
                backgroundColor: "#fff", // White background for tables
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

// Add PropTypes for validation
Dashboard.propTypes = {
  bmsData: PropTypes.object,
  signOut: PropTypes.func.isRequired,
};

export default Dashboard;
