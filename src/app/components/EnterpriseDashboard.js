import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
import Sidebar from "./Sidebar.js";
import TopBanner from "./TopBanner.js";
import DashboardMain from "./DashboardMain.js";
import DashboardCells from "./DashboardCells.js";
import DashboardInstallations from "./DashboardInstallations.js";
import LoadingSpinner from "./LoadingSpinner.js";

const EnterpriseDashboard = ({ bmsData, signOut }) => {
  const [bmsState, setBmsState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("main");

  useEffect(() => {
    if (
      bmsData &&
      bmsData.lastMinuteData &&
      bmsData.lastMinuteData.length > 0
    ) {
      setBmsState(bmsData.lastMinuteData[0]);
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

  const roundValue = (value) => parseFloat(value).toFixed(2);

  // Extract node data for cell details tab
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
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <ToastContainer />
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        signOut={signOut}
      />
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        backgroundColor: "#f0f0f0",
        maxWidth: "calc(100% - 80px)"
      }}>
        {/* Top Banner */}
        <div style={{ padding: "10px 20px" }}>
          <TopBanner bmsState={bmsState} />
        </div>
        
        {/* Main Content Area */}
        <div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          padding: "0 20px 20px",
          overflow: "hidden"
        }}>
          {/* Tab Navigation */}
          <div style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px"
          }}>
            <button
              onClick={() => setActiveTab("main")}
              style={{
                padding: "6px 15px",
                backgroundColor: activeTab === "main" ? "#FF0000" : "#ffffff",
                color: activeTab === "main" ? "#fff" : "#333333",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                fontSize: "0.85rem"
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("cells")}
              style={{
                padding: "6px 15px",
                backgroundColor: activeTab === "cells" ? "#FF0000" : "#ffffff",
                color: activeTab === "cells" ? "#fff" : "#333333",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                fontSize: "0.85rem"
              }}
            >
              Cell Details
            </button>
            <button
              onClick={() => setActiveTab("installations")}
              style={{
                padding: "6px 15px",
                backgroundColor: activeTab === "installations" ? "#FF0000" : "#ffffff",
                color: activeTab === "installations" ? "#fff" : "#333333",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                fontSize: "0.85rem"
              }}
            >
              Installations
            </button>
          </div>
          
          {/* Tab Content */}
          {activeTab === "main" && (
            <DashboardMain bmsState={bmsState} roundValue={roundValue} />
          )}
          
          {activeTab === "cells" && (
            <DashboardCells bmsState={bmsState} nodeData={nodeData} roundValue={roundValue} />
          )}
          
          {activeTab === "installations" && (
            <DashboardInstallations />
          )}
        </div>
      </div>
    </div>
  );
};

// Add PropTypes for validation
EnterpriseDashboard.propTypes = {
  bmsData: PropTypes.object,
  signOut: PropTypes.func.isRequired,
};

export default EnterpriseDashboard;