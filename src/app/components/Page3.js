import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Sidebar from "./Sidebar.js";

const Page3 = ({ signOut }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate(); // Get the navigate function

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f5f9",
        fontFamily:
          "Public Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        signOut={signOut}
        navigate={navigate} // Pass navigate to Sidebar
      />
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#f5f5f9",
          maxWidth: "calc(100% - 80px)",
        }}
      >
        <h1>Page 3 Content</h1>
        <p>This is the Settings page.</p>
      </div>
    </div>
  );
};

export default Page3;
