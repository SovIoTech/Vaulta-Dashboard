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

// Add the `region` parameter to the `awsconfig` object
awsconfig.region = awsconfig.aws_project_region;

// Configure Amplify with the updated `awsconfig`
Amplify.configure(awsconfig);

// Create a new component to handle the routes and animations
const AnimatedRoutes = ({ bmsData, lambdaResponse, user }) => {
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
  const { data: bmsData, error: dynamoError } = useDynamoDB(); // Fetch BMS data
  const [lambdaResponse, setLambdaResponse] = useState(null); // State to store Lambda response
  const [loading, setLoading] = useState(false); // Loading state for Lambda
  const [lambdaError, setLambdaError] = useState(null); // Error state for Lambda

  // Fetch Lambda data as soon as the user logs in
  useEffect(() => {
    const fetchLambdaData = async () => {
      setLoading(true);
      setLambdaError(null);

      try {
        // Invoke the Lambda function with a default or selected TagID
        const response = await invokeLambdaFunction("0x440"); // Default TagID
        setLambdaResponse(response); // Save the Lambda response
      } catch (error) {
        console.error("Error fetching Lambda data:", error);
        setLambdaError("Failed to fetch Lambda data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch Lambda data only if the user is logged in
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
