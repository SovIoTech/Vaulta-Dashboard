import React from "react";
import MLDashboardContainer from "./MLDashboardContainer.js";

// Main MLDashboard component - serves as an entry point
const MLDashboard = ({ signOut, bmsData, lambdaResponse }) => {
  return <MLDashboardContainer signOut={signOut} bmsData={bmsData} lambdaResponse={lambdaResponse} />;
};

export default MLDashboard;