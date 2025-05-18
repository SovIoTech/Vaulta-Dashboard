import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBanner from "./TopBanner.js";
import { fetchData } from "./DataFetcher.js";
import DataViewer from "./DataViewer.js";
import LoadingSpinner from "./LoadingSpinner.js";

// Using the same color scheme from WeatherCard
const colors = {
  primary: "#818181",
  secondary: "#c0c0c0",
  accentGreen: "#4CAF50",
  accentRed: "#F44336",
  accentBlue: "#2196F3",
  background: "rgba(192, 192, 192, 0.1)",
  textDark: "#333333",
  textLight: "#555555",
  highlight: "#FFC107",
};

const Page3 = ({ signOut }) => {
  const [selectedTagId, setSelectedTagId] = useState("0x440");
  const [selectedTimeRange, setSelectedTimeRange] = useState("1hour");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const [bmsState, setBmsState] = useState({
    DeviceId: { N: "ANALYTICS-DEVICE" },
    SerialNumber: { N: "12345678" },
    TagID: { S: "BAT-ANALYTICS" },
  });

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

  const timeRanges = [
    { label: "Last 1 Minute", value: "1min" },
    { label: "Last 5 Minutes", value: "5min" },
    { label: "Last 1 Hour", value: "1hour" },
    { label: "Last 8 Hours", value: "8hours" },
    { label: "Last 1 Day", value: "1day" },
    { label: "Last 7 Days", value: "7days" },
    { label: "Last 1 Month", value: "1month" },
  ];

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

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

  const TabControls = () => <div></div>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#fff",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* TopBanner - You might want to style this component separately */}

      <div
        style={{
          flex: 1,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          maxWidth: "3500px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Main Card Container */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: `1px solid ${colors.primary}`,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              borderBottom: `1px solid ${colors.secondary}`,
              paddingBottom: "15px",
              marginBottom: "20px",
            }}
          >
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: colors.textDark,
                margin: 0,
                letterSpacing: "0.5px",
              }}
            >
              Data Analytics
            </h1>
          </div>

          {/* Controls Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            {/* Dropdowns Row */}
            <div
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              {/* TagID Dropdown */}
              <div style={{ flex: 1, minWidth: "250px" }}>
                <label
                  style={{
                    fontSize: "0.95rem",
                    color: colors.textLight,
                    marginBottom: "8px",
                    display: "block",
                    fontWeight: "500",
                  }}
                >
                  Device ID:
                </label>
                <select
                  value={selectedTagId}
                  onChange={(e) => setSelectedTagId(e.target.value)}
                  style={{
                    padding: "10px 15px",
                    borderRadius: "6px",
                    border: `1px solid ${colors.secondary}`,
                    width: "100%",
                    fontSize: "0.95rem",
                    color: colors.textDark,
                    backgroundColor: "#fff",
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
              <div style={{ flex: 1, minWidth: "250px" }}>
                <label
                  style={{
                    fontSize: "0.95rem",
                    color: colors.textLight,
                    marginBottom: "8px",
                    display: "block",
                    fontWeight: "500",
                  }}
                >
                  Time Period:
                </label>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  style={{
                    padding: "10px 15px",
                    borderRadius: "6px",
                    border: `1px solid ${colors.secondary}`,
                    width: "100%",
                    fontSize: "0.95rem",
                    color: colors.textDark,
                    backgroundColor: "#fff",
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

            {/* Analyze Button */}
            <div style={{ alignSelf: "center" }}>
              <button
                onClick={handleFetchData}
                style={{
                  padding: "12px 24px",
                  backgroundColor: colors.primary,
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  opacity: loading ? 0.7 : 1,
                  pointerEvents: loading ? "none" : "auto",
                }}
                disabled={loading}
              >
                {loading ? "Loading..." : "Analyze Data"}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "row",
              minWidth: "300px",
            }}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  color: colors.textLight,
                }}
              >
                <div
                  style={{
                    border: `4px solid ${colors.background}`,
                    borderTop: `4px solid ${colors.primary}`,
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    animation: "spin 1s linear infinite",
                    marginBottom: "20px",
                  }}
                ></div>
                <p>Processing data...</p>
              </div>
            ) : error ? (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: colors.background,
                  borderRadius: "8px",
                  color: colors.accentRed,
                  textAlign: "center",
                  border: `1px solid ${colors.secondary}`,
                }}
              >
                {error}
              </div>
            ) : data ? (
              <div
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  borderRadius: "8px",
                  padding: "15px",
                  border: `1px solid ${colors.secondary}`,
                }}
              >
                <DataViewer data={data} />
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: colors.textLight,
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                Select device and time range, then click "Analyze Data" to view
                battery analytics.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spinner animation */}
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
