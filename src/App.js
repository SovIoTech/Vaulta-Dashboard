import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports.js";
import AuthWrapper from "./AuthWrapper.js";
import Dashboard from "./app/components/Dashboard.js";
import Page2 from "./app/components/Page2.js";
import Page3 from "./app/components/Page3.js";
import Page4 from "./app/components/Page4.js";
import Page5 from "./app/components/Page5.js";
import useDynamoDB from "./useDynamoDB.js";
import { invokeLambdaFunction } from "./calc/lastmonthdata.js";
import "@aws-amplify/ui-react/styles.css";
import { AnimatePresence, motion } from "framer-motion";
import MLDashboard from "./app/components/MLDashboard.js";
import { fetchAuthSession } from "aws-amplify/auth";
import AWS from "aws-sdk";
import { getLatestReading } from "./queries.js";

// Add the `region` parameter to the `awsconfig` object
awsconfig.region = awsconfig.aws_project_region;

// Configure Amplify with the updated `awsconfig`
Amplify.configure(awsconfig);

// Create a new component to handle the routes and animations
const AnimatedRoutes = ({ bmsData, lambdaResponse, user }) => {
  const location = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      x: -100,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.1,
      },
    },
    exit: {
      opacity: 0,
      x: 100,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.1,
      },
    },
  };

  // ProtectedRoute component to guard routes
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Default route (login/sign-up) */}
        <Route
          path="/"
          element={
            !user ? (
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <p>Please sign in to access the dashboard.</p>
              </motion.div>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Dashboard route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Dashboard bmsData={bmsData} />
              </motion.div>
            </ProtectedRoute>
          }
        />

        {/* Page2 route */}
        <Route
          path="/page2"
          element={
            <ProtectedRoute>
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Page2 />
              </motion.div>
            </ProtectedRoute>
          }
        />

        {/* Page3 route */}
        <Route
          path="/page3"
          element={
            <ProtectedRoute>
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Page3 />
              </motion.div>
            </ProtectedRoute>
          }
        />

        {/* Page4 route */}
        <Route
          path="/page4"
          element={
            <ProtectedRoute>
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Page4 />
              </motion.div>
            </ProtectedRoute>
          }
        />

        {/* Page5 route */}
        <Route
          path="/page5"
          element={
            <ProtectedRoute>
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Page5 bmsData={bmsData} lambdaResponse={lambdaResponse} />
              </motion.div>
            </ProtectedRoute>
          }
        />

        {/* ML Dashboard route */}
        <Route
          path="/ml-dashboard"
          element={
            <ProtectedRoute>
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <MLDashboard
                  bmsData={bmsData}
                  lambdaResponse={lambdaResponse}
                />
              </motion.div>
            </ProtectedRoute>
          }
        />

        {/* Fallback route for unmatched paths */}
        <Route
          path="*"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Navigate to="/" replace />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { data: bmsData, error: dynamoError } = useDynamoDB();
  const [lambdaResponse, setLambdaResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lambdaError, setLambdaError] = useState(null);

  // Fetch Lambda data for Page5
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

      setLoading(true);
      setLambdaError(null);

      try {
        // Get TagID from the current data
        const currentTagId = bmsData.lastMinuteData[0].TagID;
        const tagIdSuffix = currentTagId.split("BAT-")[1] || "0x440"; // Extract the suffix

        console.log("Invoking Lambda function with TagID:", tagIdSuffix);
        const response = await invokeLambdaFunction(tagIdSuffix, "7days"); // Pass time range
        console.log("Lambda response received:", response);
        setLambdaResponse(response);
      } catch (error) {
        console.error("Error fetching Lambda data:", error);
        setLambdaError("Failed to fetch Lambda data. Please try again.");
      } finally {
        setLoading(false);
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

  return (
    <BrowserRouter>
      <AuthWrapper>
        {({ user }) => (
          <AnimatedRoutes
            bmsData={bmsData}
            lambdaResponse={lambdaResponse}
            user={user}
          />
        )}
      </AuthWrapper>
    </BrowserRouter>
  );
}

export default App;
