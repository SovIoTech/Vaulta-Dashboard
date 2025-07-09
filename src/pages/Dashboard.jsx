// src/pages/Dashboard.jsx (Fixed Imports for Step 8)
import React, { useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";

// Import new services and hooks
import { useAuth } from "../hooks/useAuth.js";
import { useData } from "../hooks/useData.js";
import { theme } from "../styles/theme.js";
import { formatTime } from "../utils/helpers.js";

// Import new dashboard components
import MetricsGrid from "../components/dashboard/MetricsGrid.jsx";
import ChartsSection from "../components/dashboard/ChartsSection.jsx";
import DataTables from "../components/dashboard/DataTables.jsx";

// Import existing components (temporary - keep working components)
import TopBanner from "../app/components/TopBanner.js";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);

  // Use new hooks (always call hooks unconditionally)
  // If hooks don't exist yet, they will be undefined and we'll handle that
  const authData = useAuth() || {};
  const dataResult = useData() || {};

  // Extract data with fallbacks
  const user = authData.user || { username: "Test User" };
  const bmsData = dataResult.data || { lastMinuteData: [{}] };
  const loading = dataResult.loading || false;
  const error = dataResult.error || null;
  const lastUpdate = dataResult.lastUpdate || new Date();
  const isUpdating = dataResult.isUpdating || false;
  const refreshData = dataResult.refreshData || (() => Promise.resolve());

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refreshData();
      toast.success("Data refreshed successfully", {
        autoClose: 2000,
        toastId: "refresh-success",
      });
    } catch (error) {
      toast.error("Failed to refresh data", {
        autoClose: 3000,
        toastId: "refresh-error",
      });
    }
  }, [refreshData]);

  // Tab navigation component
  const TabControls = () => (
    <div style={{ display: "flex", gap: "10px" }}>
      <button
        onClick={() => setActiveTab("overview")}
        style={{
          margin: "0 5px",
          padding: "8px 16px",
          backgroundColor: activeTab === "overview" ? "#4CAF50" : "#ffffff",
          color: activeTab === "overview" ? "#fff" : "#333333",
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
        onClick={() => setActiveTab("detailed")}
        style={{
          margin: "0 5px",
          padding: "8px 16px",
          backgroundColor: activeTab === "detailed" ? "#4CAF50" : "#ffffff",
          color: activeTab === "detailed" ? "#fff" : "#333333",
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
        onClick={handleRefresh}
        disabled={isUpdating}
        style={{
          margin: "0 5px",
          padding: "8px 16px",
          backgroundColor: isUpdating ? "#cccccc" : "#ffffff",
          color: "#333333",
          border: "none",
          borderRadius: "5px",
          cursor: isUpdating ? "not-allowed" : "pointer",
          fontWeight: "600",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          fontSize: "0.85rem",
        }}
      >
        {isUpdating ? "Updating..." : "Refresh"}
      </button>
    </div>
  );

  // Show loading spinner while data is being fetched
  if (loading && !bmsData) {
    return <LoadingSpinner />;
  }

  // Show error state
  if (error && !bmsData) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f2f2f2",
          color: "#F44336",
          padding: "20px",
        }}
      >
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button
          onClick={handleRefresh}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1259c3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "16px",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#f2f2f2",
        fontFamily: "Arial, sans-serif",
        padding: "10px",
      }}
    >
      <ToastContainer />

      {/* Top Banner */}
      <TopBanner
        user={user}
        bmsState={bmsData?.lastMinuteData?.[0] || {}}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lastUpdate={lastUpdate}
        isUpdating={isUpdating}
      >
        <TabControls />
      </TopBanner>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {activeTab === "overview" ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              gap: "10px",
              overflow: "hidden",
            }}
          >
            {/* Left Section - Metrics */}
            <div
              style={{
                width: "30%",
                minWidth: "300px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <MetricsGrid bmsData={bmsData} />
            </div>

            {/* Right Section - Charts */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <ChartsSection bmsData={bmsData} />
            </div>
          </div>
        ) : (
          /* Detailed Data Section */
          <div
            style={{
              flex: 1,
              overflow: "hidden",
            }}
          >
            <DataTables bmsData={bmsData} />
          </div>
        )}
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  // No props needed since we're using hooks
};

export default Dashboard;
