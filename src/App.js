import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports.js";
import AuthWrapper from "./AuthWrapper.js";
import Dashboard from "./app/components/Dashboard.js";
import useDynamoDB from "./useDynamoDB.js";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(awsconfig);

function App() {
  const { data, error } = useDynamoDB();

  useEffect(() => {
    if (error) {
      console.error("Error fetching data:", error);
    } else if (data) {
      console.log("Data fetched successfully:", data);
    }
  }, [data, error]);

  return (
    <AuthWrapper>
      <Dashboard bmsData={data} />
    </AuthWrapper>
  );
}

export default App;
