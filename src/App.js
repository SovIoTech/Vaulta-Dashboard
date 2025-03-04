import React, { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth"; // Import specific auth functions
import awsconfig from "./aws-exports.js";
import AuthWrapper from "./AuthWrapper.js";
import Dashboard from "./app/components/Dashboard.js";
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

  // If no user is authenticated, show the AuthWrapper (sign-in/sign-up UI)
  if (!user) {
    return (
      <AuthWrapper>
        <p>Please sign in to access the dashboard.</p>
      </AuthWrapper>
    );
  }

  // If the user is authenticated, show the dashboard
  return (
    <AuthWrapper>
      <Dashboard bmsData={data} />
    </AuthWrapper>
  );
}

export default App;
