import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBanner from "./TopBanner.js"; // Import TopBanner instead of Sidebar
import LoadingSpinner from "./LoadingSpinner.js";
import MLTaskSelection from "./MLTaskSelection.js";
import MLVisualizationContainer from "./MLVisualizationContainer.js";
import { ProgressBar } from "./MLProgressComponents.js";

const MLDashboardContainer = ({ signOut, bmsData }) => {
  const [loading, setLoading] = useState(true);
  const [mlData, setMlData] = useState(null);
  const [rawData, setRawData] = useState({}); // Cache for raw data by tagId and timeRange
  const [selectedTagId, setSelectedTagId] = useState("0x440");
  const [selectedTimeRange, setSelectedTimeRange] = useState("1month");
  const [customChunkCount, setCustomChunkCount] = useState(4); // Default chunk count
  const [activeTask, setActiveTask] = useState("batteryHealth");
  const [showRawData, setShowRawData] = useState(false);
  const [progressInfo, setProgressInfo] = useState({});
  const [dataCollectionStatus, setDataCollectionStatus] = useState({
    batteryHealth: "Not Started",
    anomalyDetection: "Not Started",
    energyOptimization: "Not Started",
    predictiveMaintenance: "Not Started",
  });
  const [darkMode, setDarkMode] = useState(false); // For dark mode toggle
  const navigate = useNavigate();

  // Placeholder bmsState for TopBanner
  const [bmsState, setBmsState] = useState({
    DeviceId: { N: "ML-DEVICE" },
    SerialNumber: { N: "12345678" },
    TagID: { S: "BAT-ML" },
  });

  // Time range options for data collection
  const timeRanges = [
    { label: "Last 1 Month", value: "1month" },
    { label: "Last 3 Months", value: "3months" },
    { label: "Last 6 Months", value: "6months" },
    { label: "Last 1 Year", value: "1year" },
  ];

  // Chunk options with more granular control
  const chunkOptions = [2, 4, 8, 12, 16, 24, 32];

  // List of TagIDs (battery IDs)
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

  // Load initial data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    if (bmsData) {
      clearTimeout(timer);
      setLoading(false);
    }

    return () => clearTimeout(timer);
  }, [bmsData]);

  // Progress callback function
  const handleProgressUpdate = (taskType, progressData) => {
    console.log(`Progress update for ${taskType}:`, progressData);

    // Update progress info state
    setProgressInfo((prev) => ({
      ...prev,
      [taskType]: progressData,
    }));

    // Update collection status based on progress stage
    if (progressData.status === "complete") {
      setDataCollectionStatus((prev) => ({
        ...prev,
        [taskType]: "Completed",
      }));
    } else if (progressData.status === "error") {
      setDataCollectionStatus((prev) => ({
        ...prev,
        [taskType]: "Failed",
      }));
    } else {
      setDataCollectionStatus((prev) => ({
        ...prev,
        [taskType]: "In Progress",
      }));
    }
  };

  // Function to calculate progress percentage for display
  const getProgressPercentage = (taskType) => {
    const progress = progressInfo[taskType];
    if (!progress) return 0;

    // For completed tasks
    if (progress.status === "complete") return 100;

    // For tasks with known percentage
    if (progress.progress?.completedPercentage) {
      return progress.progress.completedPercentage;
    }

    // For tasks in progress without percentage
    if (progress.status === "in_progress") {
      // If we have page info, use that for visual feedback
      if (progress.progress?.pageCount) {
        // Create a "bouncing" progress that never quite reaches 100%
        const base = Math.min(90, progress.progress.pageCount * 5);
        return base;
      }
      return 50; // Default to 50% if no other info
    }

    return 0;
  };

  // Function to generate a cache key for the current selection
  const getCacheKey = (tagId, timeRange) => `${tagId}-${timeRange}`;

  // Check if we have cached raw data for the current selection
  const hasCachedData = () => {
    const cacheKey = getCacheKey(selectedTagId, selectedTimeRange);
    return !!rawData[cacheKey];
  };

  // Handle chunk count change with validation
  const handleChunkCountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    // Validate and set chunk count
    if (value >= 2 && value <= 32) {
      setCustomChunkCount(value);
    }
  };

  // Empty component for tab controls (needed for TopBanner)
  const TabControls = () => <div></div>;

  if (loading && !bmsData) {
    return <LoadingSpinner />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f2f2f2",
        fontFamily:
          "SamsungOne, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        padding: "10px",
      }}
    >
      {/* TopBanner replacing Sidebar */}
      <TopBanner
        user={{ username: "ML Analyst" }}
        bmsState={bmsState}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lastUpdate={new Date()}
        isUpdating={false}
      >
        <TabControls />
      </TopBanner>

      <div
        style={{
          flex: 1,
          backgroundColor: "#f2f2f2",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1259c3",
              marginBottom: "20px",
              borderBottom: "1px solid #e0e0e0",
              paddingBottom: "10px",
            }}
          >
            Machine Learning Data Collection
          </h1>

          {/* Data Collection Controls */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            {/* Device Selection */}
            <div
              style={{
                flex: "1 1 200px",
                backgroundColor: "#f9f9f9",
                padding: "15px",
                borderRadius: "15px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <label
                style={{
                  fontSize: "14px",
                  color: "#757575",
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                Battery ID:
              </label>
              <select
                value={selectedTagId}
                onChange={(e) => setSelectedTagId(e.target.value)}
                style={{
                  padding: "10px 15px",
                  borderRadius: "25px",
                  border: "1px solid #e6e6e6",
                  width: "100%",
                  fontSize: "14px",
                  color: "#000000",
                  backgroundColor: "#ffffff",
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

            {/* Time Range Selection */}
            <div
              style={{
                flex: "1 1 200px",
                backgroundColor: "#f9f9f9",
                padding: "15px",
                borderRadius: "15px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <label
                style={{
                  fontSize: "14px",
                  color: "#757575",
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                Data Time Range:
              </label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                style={{
                  padding: "10px 15px",
                  borderRadius: "25px",
                  border: "1px solid #e6e6e6",
                  width: "100%",
                  fontSize: "14px",
                  color: "#000000",
                  backgroundColor: "#ffffff",
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

            {/* Chunk Count Selection */}
            <div
              style={{
                flex: "1 1 200px",
                backgroundColor: "#f9f9f9",
                padding: "15px",
                borderRadius: "15px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <label
                style={{
                  fontSize: "14px",
                  color: "#757575",
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                Parallel Chunks:
              </label>
              <select
                value={customChunkCount}
                onChange={handleChunkCountChange}
                style={{
                  padding: "10px 15px",
                  borderRadius: "25px",
                  border: "1px solid #e6e6e6",
                  width: "100%",
                  fontSize: "14px",
                  color: "#000000",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                }}
              >
                {chunkOptions.map((count) => (
                  <option key={count} value={count}>
                    {count} {count === 1 ? "Chunk" : "Chunks"}
                  </option>
                ))}
              </select>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "8px",
                  fontStyle: "italic",
                }}
              >
                More chunks = faster processing but higher server load
              </div>
            </div>
          </div>

          {/* Data Cache Status */}
          {hasCachedData() && (
            <div
              style={{
                backgroundColor: "#E8F5E9",
                color: "#2E7D32",
                padding: "10px 15px",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div style={{ fontWeight: "500" }}>✓</div>
              <div>
                Data for {selectedTagId} with {selectedTimeRange} time range is
                already cached. Tasks will use the cached data instead of
                fetching again.
              </div>
            </div>
          )}

          {/* Task Selection Grid */}
          <MLTaskSelection
            dataCollectionStatus={dataCollectionStatus}
            progressInfo={progressInfo}
            getProgressPercentage={getProgressPercentage}
            hasCachedData={hasCachedData}
            selectedTagId={selectedTagId}
            selectedTimeRange={selectedTimeRange}
            customChunkCount={customChunkCount}
            setMlData={setMlData}
            setRawData={setRawData}
            setActiveTask={setActiveTask}
            getCacheKey={getCacheKey}
            rawData={rawData}
            handleProgressUpdate={handleProgressUpdate}
          />

          {/* Visualization Container - Show when data is collected */}
          {mlData && Object.keys(mlData).some((key) => mlData[key]) && (
            <MLVisualizationContainer
              mlData={mlData}
              activeTask={activeTask}
              setActiveTask={setActiveTask}
              showRawData={showRawData}
              setShowRawData={setShowRawData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MLDashboardContainer;
