import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBanner from "./TopBanner.js";
import { fetchData } from "./DataFetcher.js";
import DataViewer from "./DataViewer.js";
import LoadingSpinner from "./LoadingSpinner.js";

const Page3 = ({ signOut }) => {
  const [selectedTagId, setSelectedTagId] = useState("0x440"); // Default TagID
  const [selectedTimeRange, setSelectedTimeRange] = useState("1hour"); // Default time range
  const [data, setData] = useState(null); // State to store fetched data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [darkMode, setDarkMode] = useState(false); // For dark mode toggle
  const navigate = useNavigate();

  // Placeholder bmsState for TopBanner
  const [bmsState, setBmsState] = useState({
    DeviceId: { N: "ANALYTICS-DEVICE" },
    SerialNumber: { N: "12345678" },
    TagID: { S: "BAT-ANALYTICS" },
  });

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

  // Empty component for tab controls (needed for TopBanner)
  const TabControls = () => <div></div>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f2f2f2", // OneUI light background
        fontFamily:
          "SamsungOne, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        padding: "10px",
      }}
    >
      {/* TopBanner replacing Sidebar */}
      <TopBanner
        user={{ username: "Analyst" }}
        bmsState={bmsState}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lastUpdate={new Date()}
        isUpdating={loading}
      >
        <TabControls />
      </TopBanner>

      <div
        style={{
          flex: 1,
          backgroundColor: "#f2f2f2", // OneUI light background
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "15px", // Rounded corners for OneUI
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)", // OneUI shadow
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1259c3", // OneUI blue
              marginBottom: "20px",
              borderBottom: "1px solid #e0e0e0",
              paddingBottom: "10px",
            }}
          >
            Data Analytics
          </h1>

          {/* TagID and Time Range Dropdowns */}
          <div
            style={{
              display: "flex",
              gap: "20px", // Space between the dropdowns
              marginBottom: "20px",
              flexWrap: "wrap", // Wrap on small screens
            }}
          >
            {/* TagID Dropdown */}
            <div
              style={{
                flex: 1, // Take up equal space
                backgroundColor: "#f9f9f9", // Light card background
                padding: "15px",
                borderRadius: "15px", // Rounded corners for OneUI
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                minWidth: "200px", // Ensure minimum width
              }}
            >
              <label
                htmlFor="tagId"
                style={{
                  fontSize: "14px",
                  color: "#757575", // Gray text for labels
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                Device ID:
              </label>
              <select
                id="tagId"
                value={selectedTagId}
                onChange={(e) => setSelectedTagId(e.target.value)}
                style={{
                  padding: "10px 15px",
                  borderRadius: "25px", // Rounded corners for OneUI
                  border: "1px solid #e6e6e6",
                  width: "100%",
                  fontSize: "14px",
                  color: "#000000", // OneUI text color
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
                padding: "15px",
                borderRadius: "15px", // Rounded corners for OneUI
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                minWidth: "200px", // Ensure minimum width
              }}
            >
              <label
                htmlFor="timeRange"
                style={{
                  fontSize: "14px",
                  color: "#757575", // Gray text for labels
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                Time Period:
              </label>
              <select
                id="timeRange"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                style={{
                  padding: "10px 15px",
                  borderRadius: "25px", // Rounded corners for OneUI
                  border: "1px solid #e6e6e6",
                  width: "100%",
                  fontSize: "14px",
                  color: "#000000", // OneUI text color
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
                padding: "12px 24px",
                backgroundColor: "#1259c3", // OneUI blue
                color: "white",
                border: "none",
                borderRadius: "25px", // Rounded corners for OneUI
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                boxShadow: "0 2px 8px rgba(18, 89, 195, 0.3)", // Soft blue shadow
                transition: "all 0.3s ease",
                display: "inline-flex",
                alignItems: "center",
              }}
              disabled={loading}
            >
              {loading ? "Loading..." : "Analyze Data"}
            </button>
          </div>

          {/* Display Data or Loading State */}
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#757575",
              }}
            >
              <div
                style={{
                  border: "4px solid rgba(18, 89, 195, 0.3)", // OneUI blue border
                  borderTop: "4px solid #1259c3", // OneUI blue top border
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 20px",
                }}
              ></div>
              <p>Processing data...</p>
            </div>
          ) : error ? (
            <div
              style={{
                padding: "20px",
                backgroundColor: "#ffebee", // Light red background
                borderRadius: "15px", // Rounded corners for OneUI
                color: "#F44336", // Red text
                textAlign: "center",
                marginTop: "20px",
              }}
            >
              {error}
            </div>
          ) : data ? (
            <div
              style={{
                backgroundColor: "#f9f9f9",
                borderRadius: "15px", // Rounded corners for OneUI
                padding: "20px",
                marginTop: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <DataViewer data={data} />
            </div>
          ) : (
            <div
              style={{
                padding: "40px 0",
                textAlign: "center",
                color: "#757575",
              }}
            >
              Select device and time range, then click "Analyze Data" to view
              battery analytics.
            </div>
          )}
        </div>
      </div>

      {/* Add spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Page3;
