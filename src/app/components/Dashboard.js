import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Sidebar from "./Sidebar.js";
import TopBanner from "./TopBanner.js";
import Cards from "./Cards.js";
import Gauges from "./Gauges.js";
import NodeTables from "./NodeTables.js";
import LoadingSpinner from "./LoadingSpinner.js";

const Dashboard = ({ bmsData, signOut }) => {
  const [bmsState, setBmsState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate(); // Get the navigate function

  const baseIds = [
    "0x100",
    "0x140",
    "0x180",
    "0x1C0",
    "0x200",
    "0x240",
    "0x280",
    "0x2C0",
    "0x400",
    "0x440",
    "0x480",
    "0x4C0",
    "0x500",
    "0x540",
    "0x580",
    "0x5C0",
    "0x600",
    "0x640",
    "0x680",
    "0x6C0",
    "0x740",
    "0x780",
  ];

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
    }
  }, [bmsData]);

  const roundValue = (value) => parseFloat(value).toFixed(2);

  const nodeData = [
    {
      node: "Node 00",
      data: {
        balanceStatus: roundValue(bmsState?.Node00BalanceStatus?.N || 0),
        totalVoltage: roundValue(bmsState?.Node00TotalVoltage?.N || 0),
        cellVoltages: Array.from({ length: 14 }, (_, i) =>
          roundValue(bmsState?.[`Node00Cell${i < 10 ? `0${i}` : i}`]?.N || 0)
        ),
        temperatures: Array.from({ length: 6 }, (_, i) =>
          roundValue(bmsState?.[`Node00Temp${i < 10 ? `0${i}` : i}`]?.N || 0)
        ),
        tempCount: roundValue(bmsState?.Node00TempCount?.N || 0),
      },
    },
    {
      node: "Node 01",
      data: {
        balanceStatus: roundValue(bmsState?.Node01BalanceStatus?.N || 0),
        totalVoltage: roundValue(bmsState?.Node01TotalVoltage?.N || 0),
        cellVoltages: Array.from({ length: 14 }, (_, i) =>
          roundValue(bmsState?.[`Node01Cell${i < 10 ? `0${i}` : i}`]?.N || 0)
        ),
        temperatures: Array.from({ length: 6 }, (_, i) =>
          roundValue(bmsState?.[`Node01Temp${i < 10 ? `0${i}` : i}`]?.N || 0)
        ),
        tempCount: roundValue(bmsState?.Node01TempCount?.N || 0),
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
        backgroundColor: "#f5f5f9",
        fontFamily:
          "Public Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        signOut={signOut}
        navigate={navigate} // Pass navigate to Sidebar
      />
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#f5f5f9", // Consistent with outer background
          maxWidth: "calc(100% - 80px)", // Adjust for sidebar width
        }}
      >
        <TopBanner bmsState={bmsState} baseIds={baseIds} />
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            marginBottom: "20px",
          }}
        >
          <Cards bmsState={bmsState} roundValue={roundValue} />
        </div>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            marginBottom: "20px",
          }}
        >
          <Gauges bmsState={bmsState} roundValue={roundValue} />
        </div>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}
        >
          <NodeTables nodeData={nodeData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
