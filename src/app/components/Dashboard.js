import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // For popup notifications
import "react-toastify/dist/ReactToastify.css"; // CSS for notifications
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
  const navigate = useNavigate();

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
        backgroundColor: "#f8f9fa", // CoreUI's light background color
        fontFamily:
          "Public Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <ToastContainer /> {/* For displaying popup notifications */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        signOut={signOut}
        navigate={navigate}
      />
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#f8f9fa", // CoreUI's light background color
          maxWidth: "calc(100% - 80px)",
          overflow: "hidden", // Prevent vertical scrolling
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
              backgroundColor: activeTab === "cards" ? "#3c4b64" : "#f8f9fa",
              color: activeTab === "cards" ? "#fff" : "#4f5d73",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Cards & Gauges
          </button>
          <button
            onClick={() => setActiveTab("tables")}
            style={{
              margin: "0 10px",
              padding: "10px 20px",
              backgroundColor: activeTab === "tables" ? "#3c4b64" : "#f8f9fa",
              color: activeTab === "tables" ? "#fff" : "#4f5d73",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Tables
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
                  borderRadius: "8px",
                  padding: "20px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  marginBottom: "20px",
                  width: "100%",
                }}
              >
                <Cards bmsState={bmsState} roundValue={roundValue} />
              </div>

              {/* Gauges Section */}
              <div
                style={{
                  backgroundColor: "#fff", // White background for gauges
                  borderRadius: "8px",
                  padding: "20px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  width: "100%",
                }}
              >
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
                borderRadius: "8px",
                padding: "20px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                width: "100%",
              }}
            >
              <NodeTables nodeData={nodeData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
