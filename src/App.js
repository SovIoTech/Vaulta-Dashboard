import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth"; // Import specific auth functions
import awsconfig from "./aws-exports.js";
import AuthWrapper from "./AuthWrapper.js";
import Dashboard from "./app/components/Dashboard.js";
import Page2 from "./app/components/Page2.js"; // Import Page2
import Page3 from "./app/components/Page3.js"; // Import Page3
import useDynamoDB from "./useDynamoDB.js";
import "@aws-amplify/ui-react/styles.css";
import LoadingSpinner from "./app/components/LoadingSpinner.js";

Amplify.configure(awsconfig);

function App() {
  const [user, setUser] = useState(null); // Track authenticated user
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const { data, error } = useDynamoDB(user); // Fetch data only if user is authenticated

  // Check if the user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession(); // Fetch the current auth session
        if (session.tokens && session.tokens.idToken) {
          const userInfo = session.tokens.idToken.payload; // Extract user info
          setUser(userInfo); // Set the authenticated user
          console.log("User is authenticated:", userInfo);
        } else {
          setUser(null); // No user is authenticated
        }
      } catch (error) {
        console.log("User is not authenticated:", error);
        setUser(null); // No user is authenticated
      } finally {
        setIsLoading(false); // Stop loading after auth check
      }
    };

    checkAuth();
  }, []);

  // Handle errors from useDynamoDB
  useEffect(() => {
    if (error) {
      console.error("Error fetching data:", error);
      // Optionally, display an error message to the user
    }
  }, [error]);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ProtectedRoute component to guard routes
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/" replace />; // Redirect to login if not authenticated
    }
    return children;
  };

  return (
    <BrowserRouter>
      <AuthWrapper>
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
              <ProtectedRoute>
                <Dashboard bmsData={data} />
              </ProtectedRoute>
            }
          />

          {/* Page2 route */}
          <Route
            path="/page2"
            element={
              <ProtectedRoute>
                <Page2 />
              </ProtectedRoute>
            }
          />

          {/* Page3 route */}
          <Route
            path="/page3"
            element={
              <ProtectedRoute>
                <Page3 />
              </ProtectedRoute>
            }
          />

          {/* Fallback route for unmatched paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthWrapper>
    </BrowserRouter>
  );
}

export default App;
