import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar.js";
import { fetchData } from "./DataFetcher.js"; // Import the fetchData function
import DataViewer from "./DataViewer.js"; // Import the DataViewer component

const Page3 = ({ signOut }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState("0x440"); // Default TagID
  const [selectedTimeRange, setSelectedTimeRange] = useState("1min"); // Default time range
  const [data, setData] = useState(null); // State to store fetched data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate();

  // List of TagIDs
  const baseIds = [
    "0x100",
    "0x140",
    "0x180",
    "0x1C0",
    "0x200",
    "0x240",
    "0x280",
    "0x2C0",
    "0x400",
    "0x440",
    "0x480",
    "0x4C0",
    "0x500",
    "0x540",
    "0x580",
    "0x5C0",
    "0x600",
    "0x640",
    "0x680",
    "0x6C0",
    "0x740",
    "0x780",
  ];

  // Time range options
  const timeRanges = [
    { label: "Last 1 Minute", value: "1min" },
    { label: "Last 5 Minutes", value: "5min" },
    { label: "Last 1 Hour", value: "1hour" },
    { label: "Last 8 Hours", value: "8hours" },
    { label: "Last 1 Day", value: "1day" },
    { label: "Last 7 Days", value: "7days" },
    { label: "Last 1 Month", value: "1month" },
  ];

  // Function to handle fetching data
  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null); // Reset data

    try {
      const fetchedData = await fetchData(selectedTagId, selectedTimeRange);
      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#ffffff", // White background
        color: "#1e1e2f", // Dark text
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        signOut={signOut}
        navigate={navigate}
      />
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#ffffff", // White background
          maxWidth: "calc(100% - 80px)",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#1e1e2f", // Dark text
            marginBottom: "20px",
          }}
        >
          Data Viewer
        </h1>

        {/* TagID and Time Range Dropdowns */}
        <div
          style={{
            display: "flex",
            gap: "10px", // Space between the dropdowns
            marginBottom: "20px",
          }}
        >
          {/* TagID Dropdown */}
          <div
            style={{
              flex: 1, // Take up equal space
              backgroundColor: "#f9f9f9", // Light card background
              padding: "10px",
              borderRadius: "12px", // Rounded corners
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Soft shadow
            }}
          >
            <label
              htmlFor="tagId"
              style={{
                fontSize: "14px",
                color: "#666666", // Gray text for labels
                marginBottom: "5px",
                display: "block",
              }}
            >
              Select TagID:
            </label>
            <select
              id="tagId"
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e0e0e0", // Light border
                width: "100%",
                fontSize: "14px",
                color: "#1e1e2f", // Dark text
                backgroundColor: "#ffffff", // White background
                cursor: "pointer",
              }}
            >
              {baseIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Dropdown */}
          <div
            style={{
              flex: 1, // Take up equal space
              backgroundColor: "#f9f9f9", // Light card background
              padding: "10px",
              borderRadius: "12px", // Rounded corners
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Soft shadow
            }}
          >
            <label
              htmlFor="timeRange"
              style={{
                fontSize: "14px",
                color: "#666666", // Gray text for labels
                marginBottom: "5px",
                display: "block",
              }}
            >
              Select Time Range:
            </label>
            <select
              id="timeRange"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e0e0e0", // Light border
                width: "100%",
                fontSize: "14px",
                color: "#1e1e2f", // Dark text
                backgroundColor: "#ffffff", // White background
                cursor: "pointer",
              }}
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Button to fetch data */}
        <div
          style={{
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <button
            onClick={handleFetchData}
            style={{
              padding: "10px 20px",
              backgroundColor: "#696cff", // Accent color
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Soft shadow
              transition: "background-color 0.3s ease",
            }}
            className="hover:bg-[#5a5eff]" // Hover effect
          >
            Fetch Data
          </button>
        </div>

        {/* Display Data */}
        {loading ? (
          <p
            style={{
              fontSize: "14px",
              color: "#666666", // Gray text for loading
              textAlign: "center",
            }}
          >
            Loading data...
          </p>
        ) : error ? (
          <p
            style={{
              fontSize: "14px",
              color: "#dc3545", // Red text for errors
              textAlign: "center",
            }}
          >
            {error}
          </p>
        ) : data ? (
          <>
            {/* Render Node0 and Node1 Data */}
            <DataViewer data={data} />
          </>
        ) : (
          <p
            style={{
              fontSize: "14px",
              color: "#666666", // Gray text for no data
              textAlign: "center",
            }}
          >
            No data available.
          </p>
        )}
      </div>
    </div>
  );
};

export default Page3;
