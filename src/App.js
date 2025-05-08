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
import Page2 from "./app/components/Page2.js"; // Import Page2
import Page3 from "./app/components/Page3.js"; // Import Page3
import Page4 from "./app/components/Page4.js"; // Import Page4
import Page5 from "./app/components/Page5.js"; // Import Page5
import useDynamoDB from "./useDynamoDB.js";
import { invokeLambdaFunction } from "./calc/lastmonthdata.js"; // Import the Lambda invoker function
import "@aws-amplify/ui-react/styles.css";
import { AnimatePresence, motion } from "framer-motion"; // For smooth transitions
import MLDashboard from "./app/components/MLDashboard.js"; // Import the new MLDashboard component

// Add the `region` parameter to the `awsconfig` object
awsconfig.region = awsconfig.aws_project_region;

// Configure Amplify with the updated `awsconfig`
Amplify.configure(awsconfig);

// Battery IDs to monitor - using the optimized structure format
const BATTERY_IDS = ["BAT-0x440"];

// Auto-refresh interval in milliseconds (30 seconds)
const REFRESH_INTERVAL = 30000;

// Create a new component to handle the routes and animations
const AnimatedRoutes = ({ bmsData, lambdaResponse, user, loading }) => {
  const location = useLocation(); // useLocation is now inside the Router context

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
      return <Navigate to="/" replace />; // Redirect to login if not authenticated
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
                <Dashboard bmsData={bmsData} loading={loading} />
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
                <MLDashboard bmsData={bmsData} lambdaResponse={lambdaResponse} />
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
  // Use the enhanced DynamoDB hook with auto-refresh and specific battery IDs
  const { 
    data, 
    loading, 
    errorMessage: dynamoError, 
    refreshData 
  } = useDynamoDB(BATTERY_IDS, REFRESH_INTERVAL);
  
  // Extract primary battery data for backward compatibility
  const [bmsData, setBmsData] = useState(null);
  
  // Update bmsData when data changes
  useEffect(() => {
    if (data && BATTERY_IDS.length > 0) {
      // Format data for backward compatibility
      // Use the first battery ID as the primary one
      const primaryBatteryId = BATTERY_IDS[0];
      const primaryBatteryData = data[primaryBatteryId];
      
      if (primaryBatteryData) {
        setBmsData({
          // For backward compatibility with existing components
          lastMinuteData: primaryBatteryData.lastMinute || [],
          lastHourData: primaryBatteryData.lastHour || [],
          lastDayData: primaryBatteryData.lastDay || [],
          latestReading: primaryBatteryData.latest || null,
          // Also include the full data structure for components that can use it
          allBatteries: data
        });
      }
    } else {
      setBmsData(null);
    }
  }, [data]);
  
  const [lambdaResponse, setLambdaResponse] = useState(null); // State to store Lambda response
  const [lambdaLoading, setLambdaLoading] = useState(false); // Loading state for Lambda
  const [lambdaError, setLambdaError] = useState(null); // Error state for Lambda

  // Fetch Lambda data as soon as the user logs in
  useEffect(() => {
    const fetchLambdaData = async () => {
      setLambdaLoading(true);
      setLambdaError(null);

      try {
        // Extract the ID without the "BAT-" prefix
        const tagId = BATTERY_IDS[0].replace('BAT-', '');
        
        // Invoke the Lambda function with the first battery ID
        const response = await invokeLambdaFunction(tagId);
        setLambdaResponse(response); // Save the Lambda response
      } catch (error) {
        console.error("Error fetching Lambda data:", error);
        setLambdaError("Failed to fetch Lambda data. Please try again.");
      } finally {
        setLambdaLoading(false);
      }
    };

    // Fetch Lambda data only if the user is logged in (bmsData is available)
    if (bmsData) {
      fetchLambdaData();
    }
  }, [bmsData]); // Trigger when BMS data is available (user is logged in)

  // Handle errors from useDynamoDB
  useEffect(() => {
    if (dynamoError) {
      console.error("Error fetching BMS data:", dynamoError);
      // Optionally, display an error message to the user
    }
  }, [dynamoError]);

  // Implement manual data refresh on focus
  useEffect(() => {
    const handleFocus = () => {
      console.log("Window focused - refreshing data");
      refreshData(); // Refresh DynamoDB data
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshData]);

  return (
    <BrowserRouter>
      <AuthWrapper>
        {({ user }) => (
          <AnimatedRoutes
            bmsData={bmsData}
            lambdaResponse={lambdaResponse}
            user={user}
            loading={loading || lambdaLoading}
          />
        )}
      </AuthWrapper>
    </BrowserRouter>
  );
}

export default App;