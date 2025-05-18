import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports.js";
import AuthWrapper from "./AuthWrapper.js";
import Dashboard from "./app/components/Dashboard.js";
import UserManagement from "./app/components/UserManagement.js"; // Renamed from Page2
import DataAnalytics from "./app/components/DataAnalytics.js"; // Renamed from Page3
import SystemSettings from "./app/components/SystemSettings.js"; // Renamed from Page4
import EnergyMonitor from "./app/components/EnergyMonitor.js"; // Renamed from Page5
import MLDashboard from "./app/components/MLDashboard.js";
import Diagnostics from "./app/components/Diagnostics.js"; // New component
import Warranty from "./app/components/Warranty.js"; // New component
import TopBanner from "./app/components/TopBanner.js";
import LoadingSpinner from "./app/components/LoadingSpinner.js";
import useDynamoDB from "./useDynamoDB.js";
import { invokeLambdaFunction } from "./calc/lastmonthdata.js";
import "@aws-amplify/ui-react/styles.css";
import { AnimatePresence, motion } from "framer-motion";
import { fetchAuthSession } from "aws-amplify/auth";

// Add the `region` parameter to the `awsconfig` object
awsconfig.region = awsconfig.aws_project_region;

// Configure Amplify with the updated `awsconfig`
Amplify.configure(awsconfig);

// Main App Component
function App() {
  const { data: bmsData, error: dynamoError } = useDynamoDB();
  const [lambdaResponse, setLambdaResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lambdaError, setLambdaError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch Lambda data for Energy Monitor
  useEffect(() => {
    const fetchLambdaData = async () => {
      if (
        !bmsData ||
        !bmsData.lastMinuteData ||
        bmsData.lastMinuteData.length === 0
      ) {
        console.log("BMS data not ready yet");
        return;
      }

      setIsUpdating(true);
      setLambdaError(null);

      try {
        // Get TagID from the current data
        const currentTagId = bmsData.lastMinuteData[0].TagID;
        const tagIdSuffix = currentTagId.split("BAT-")[1] || "0x440"; // Extract the suffix

        console.log("Invoking Lambda function with TagID:", tagIdSuffix);
        const response = await invokeLambdaFunction(tagIdSuffix, "7days"); // Pass time range
        console.log("Lambda response received:", response);
        setLambdaResponse(response);
        setLastUpdate(new Date());
      } catch (error) {
        console.error("Error fetching Lambda data:", error);
        setLambdaError("Failed to fetch Lambda data. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    };

    fetchLambdaData();
  }, [bmsData]);

  // Handle errors from useDynamoDB
  useEffect(() => {
    if (dynamoError) {
      console.error("Error fetching BMS data:", dynamoError);
    }
  }, [dynamoError]);

  // Main App with Auth Wrapper
  return (
    <BrowserRouter>
      <AuthWrapper>
        {({ user, navigate }) => (
          <AppWithAuth
            user={user}
            navigate={navigate}
            bmsData={bmsData}
            lambdaResponse={lambdaResponse}
            lastUpdate={lastUpdate}
            isUpdating={isUpdating}
          />
        )}
      </AuthWrapper>
    </BrowserRouter>
  );
}

// App with Authentication - this separates the authenticated app from the auth wrapper
function AppWithAuth({
  user,
  navigate,
  bmsData,
  lambdaResponse,
  lastUpdate,
  isUpdating,
}) {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState({});

  // Define the default section for each page
  useEffect(() => {
    const path = location.pathname;
    // Set default section when path changes
    switch (path) {
      case "/dashboard":
        setActiveSection({ dashboard: "system" });
        break;
      case "/data-analytics":
        setActiveSection({ analytics: "overview" });
        break;
      case "/energy-monitor":
        setActiveSection({ energy: "keyInsights" });
        break;
      // Add defaults for other pages
      default:
        // Keep current section or set a default
        break;
    }
  }, [location.pathname]);

  // Get the current page from location
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "dashboard";
    if (path.startsWith("/user-management")) return "users";
    if (path.startsWith("/data-analytics")) return "analytics";
    if (path.startsWith("/ml-dashboard")) return "ml";
    if (path.startsWith("/system-settings")) return "settings";
    if (path.startsWith("/energy-monitor")) return "energy";
    if (path.startsWith("/diagnostics")) return "diagnostics";
    if (path.startsWith("/warranty")) return "warranty";
    return "";
  };

  // Get section controls for current page
  const getSectionControls = () => {
    const currentPage = getCurrentPage();

    // Return different section controls based on current page
    switch (currentPage) {
      case "dashboard":
        return (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setActiveSection({ dashboard: "system" })}
              style={{
                margin: "0 5px",
                padding: "8px 16px",
                backgroundColor:
                  activeSection.dashboard === "system" ? "#4CAF50" : "#ffffff",
                color:
                  activeSection.dashboard === "system" ? "#fff" : "#333333",
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
              onClick={() => setActiveSection({ dashboard: "details" })}
              style={{
                margin: "0 5px",
                padding: "8px 16px",
                backgroundColor:
                  activeSection.dashboard === "details" ? "#4CAF50" : "#ffffff",
                color:
                  activeSection.dashboard === "details" ? "#fff" : "#333333",
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
          </div>
        );
      case "energy":
        return (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setActiveSection({ energy: "keyInsights" })}
              style={{
                margin: "0 5px",
                padding: "8px 16px",
                backgroundColor:
                  activeSection.energy === "keyInsights"
                    ? "#4CAF50"
                    : "#ffffff",
                color:
                  activeSection.energy === "keyInsights" ? "#fff" : "#333333",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                fontSize: "0.85rem",
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection({ energy: "hourlyAverages" })}
              style={{
                margin: "0 5px",
                padding: "8px 16px",
                backgroundColor:
                  activeSection.energy === "hourlyAverages"
                    ? "#4CAF50"
                    : "#ffffff",
                color:
                  activeSection.energy === "hourlyAverages"
                    ? "#fff"
                    : "#333333",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                fontSize: "0.85rem",
              }}
            >
              Hourly Trends
            </button>
            <button
              onClick={() => setActiveSection({ energy: "dailySummary" })}
              style={{
                margin: "0 5px",
                padding: "8px 16px",
                backgroundColor:
                  activeSection.energy === "dailySummary"
                    ? "#4CAF50"
                    : "#ffffff",
                color:
                  activeSection.energy === "dailySummary" ? "#fff" : "#333333",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                fontSize: "0.85rem",
              }}
            >
              Daily Summary
            </button>
          </div>
        );
      case "analytics":
        return (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setActiveSection({ analytics: "overview" })}
              style={{
                margin: "0 5px",
                padding: "8px 16px",
                backgroundColor:
                  activeSection.analytics === "overview"
                    ? "#4CAF50"
                    : "#ffffff",
                color:
                  activeSection.analytics === "overview" ? "#fff" : "#333333",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                fontSize: "0.85rem",
              }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection({ analytics: "trends" })}
              style={{
                margin: "0 5px",
                padding: "8px 16px",
                backgroundColor:
                  activeSection.analytics === "trends" ? "#4CAF50" : "#ffffff",
                color:
                  activeSection.analytics === "trends" ? "#fff" : "#333333",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                fontSize: "0.85rem",
              }}
            >
              Trends
            </button>
          </div>
        );
      // Add more cases for other pages
      default:
        return null;
    }
  };

  // If no user, show login page
  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Please sign in to access the dashboard.</p>
      </div>
    );
  }

  // Define animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#f2f2f2",
      }}
    >
      {/* Persistent TopBanner that stays during page transitions */}
      <TopBanner
        user={user}
        bmsState={bmsData?.lastMinuteData?.[0] || {}}
        lastUpdate={lastUpdate}
        isUpdating={isUpdating}
        navigate={navigate}
        timestamp={bmsData?.lastMinuteData?.[0]?.Timestamp?.N} // Unix timestamp from your data
      >
        {getSectionControls()}
      </TopBanner>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "0 10px 10px 10px",
        }}
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/dashboard"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ height: "100%" }}
                >
                  <Dashboard
                    bmsData={bmsData}
                    activeSection={activeSection.dashboard || "system"}
                  />
                </motion.div>
              }
            />

            <Route
              path="/user-management"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ height: "100%" }}
                >
                  <UserManagement />
                </motion.div>
              }
            />

            <Route
              path="/data-analytics"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ height: "100%" }}
                >
                  <DataAnalytics
                    activeSection={activeSection.analytics || "overview"}
                  />
                </motion.div>
              }
            />

            <Route
              path="/ml-dashboard"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ height: "100%" }}
                >
                  <MLDashboard
                    bmsData={bmsData}
                    lambdaResponse={lambdaResponse}
                  />
                </motion.div>
              }
            />

            <Route
              path="/system-settings"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ height: "100%" }}
                >
                  <SystemSettings />
                </motion.div>
              }
            />

            <Route
              path="/energy-monitor"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ height: "100%" }}
                >
                  <EnergyMonitor
                    bmsData={bmsData}
                    lambdaResponse={lambdaResponse}
                    activeSection={activeSection.energy || "keyInsights"}
                  />
                </motion.div>
              }
            />

            {/* New routes for diagnostics and warranty */}
            <Route
              path="/diagnostics"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ height: "100%" }}
                >
                  <Diagnostics bmsData={bmsData} />
                </motion.div>
              }
            />

            <Route
              path="/warranty"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ height: "100%" }}
                >
                  <Warranty bmsData={bmsData} />
                </motion.div>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
