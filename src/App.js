import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// Add the `region` parameter to the `awsconfig` object
awsconfig.region = awsconfig.aws_project_region;

// Configure Amplify with the updated `awsconfig`
Amplify.configure(awsconfig);

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

  // ProtectedRoute component to guard routes
  const ProtectedRoute = ({ children, user }) => {
    if (!user) {
      return <Navigate to="/" replace />; // Redirect to login if not authenticated
    }
    return children;
  };

  return (
    <BrowserRouter>
      <AuthWrapper>
        {(
          { user, navigate } // Destructure navigate from AuthWrapper
        ) => (
          <>
            <Routes>
              {/* Default route (login/sign-up) */}
              <Route
                path="/"
                element={
                  !user ? (
                    <p>Please sign in to access the dashboard.</p>
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />
              {/* Dashboard route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute user={user}>
                    <Dashboard bmsData={bmsData} />
                  </ProtectedRoute>
                }
              />
              {/* Page2 route */}
              <Route
                path="/page2"
                element={
                  <ProtectedRoute user={user}>
                    <Page2 />
                  </ProtectedRoute>
                }
              />
              {/* Page3 route */}
              <Route
                path="/page3"
                element={
                  <ProtectedRoute user={user}>
                    <Page3 />
                  </ProtectedRoute>
                }
              />
              {/* Page4 route */}
              <Route
                path="/page4"
                element={
                  <ProtectedRoute user={user}>
                    <Page4 />
                  </ProtectedRoute>
                }
              />
              {/* Page5 route */}
              <Route
                path="/page5"
                element={
                  <ProtectedRoute user={user}>
                    <Page5 bmsData={bmsData} lambdaResponse={lambdaResponse} />
                  </ProtectedRoute>
                }
              />
              {/* Fallback route for unmatched paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </>
        )}
      </AuthWrapper>
    </BrowserRouter>
  );
}

export default App;
