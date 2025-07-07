// src/app/components/MLDashboardContainer.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< Updated upstream
import TopBanner from "./TopBanner.js"; // Import TopBanner instead of Sidebar
=======
import TopBanner from "./TopBanner.js";
>>>>>>> Stashed changes
import LoadingSpinner from "./LoadingSpinner.js";
import MLTaskSelection from "./MLTaskSelection.js";
import MLVisualizationContainer from "./MLVisualizationContainer.js";
import { ProgressBar } from "./MLProgressComponents.js";
<<<<<<< Updated upstream

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
=======
import { useBatteryRegistration } from "../../services/batteryRegistrationService.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MLDashboardContainer = ({ signOut, bmsData }) => {
>>>>>>> Stashed changes
  const navigate = useNavigate();
  const {
    getAccessibleOptions,
    validateAccess,
    hasActiveBatteries,
    loading: batteryLoading,
  } = useBatteryRegistration();

<<<<<<< Updated upstream
=======
  const [loading, setLoading] = useState(true);
  const [mlData, setMlData] = useState(null);
  const [rawData, setRawData] = useState({});
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("1month");
  const [customChunkCount, setCustomChunkCount] = useState(4);
  const [activeTask, setActiveTask] = useState("batteryHealth");
  const [showRawData, setShowRawData] = useState(false);
  const [progressInfo, setProgressInfo] = useState({});
  const [dataCollectionStatus, setDataCollectionStatus] = useState({
    batteryHealth: "Not Started",
    anomalyDetection: "Not Started",
    energyOptimization: "Not Started",
    predictiveMaintenance: "Not Started",
  });
  const [darkMode, setDarkMode] = useState(false);
  const [batteryOptions, setBatteryOptions] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

>>>>>>> Stashed changes
  // Placeholder bmsState for TopBanner
  const [bmsState, setBmsState] = useState({
    DeviceId: { N: "ML-DEVICE" },
    SerialNumber: { N: "12345678" },
    TagID: { S: "BAT-ML" },
  });
<<<<<<< Updated upstream

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

=======

  // Time range options for data collection
  const timeRanges = [
    { label: "Last 1 Month", value: "1month" },
    { label: "Last 3 Months", value: "3months" },
    { label: "Last 6 Months", value: "6months" },
    { label: "Last 1 Year", value: "1year" },
  ];

  // Chunk options with more granular control
  const chunkOptions = [2, 4, 8, 12, 16, 24, 32];

  // Load battery options
  const loadBatteryOptions = async () => {
    try {
      const options = getAccessibleOptions();
      setBatteryOptions(options);

      // Auto-select first option if none selected and options available
      if (!selectedTagId && options.length > 0) {
        setSelectedTagId(options[0].batteryId);
        // Update BMS state for the selected battery
        setBmsState({
          DeviceId: { N: options[0].batteryId },
          SerialNumber: { N: options[0].serialNumber },
          TagID: { S: `BAT-${options[0].batteryId}` },
        });
      }

      if (initialLoad && options.length === 0 && !batteryLoading) {
        toast.warning(
          "You need to register batteries first to access ML features"
        );
      }

      setInitialLoad(false);
    } catch (error) {
      console.error("Error loading battery options:", error);
      toast.error("Failed to load your registered batteries");
    }
  };

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
  // Load battery options on mount and when batteries change
  useEffect(() => {
    loadBatteryOptions();
  }, [getAccessibleOptions, batteryLoading]);

>>>>>>> Stashed changes
  // Progress callback function
  const handleProgressUpdate = (taskType, progressData) => {
    console.log(`Progress update for ${taskType}:`, progressData);

<<<<<<< Updated upstream
    // Update progress info state
=======
>>>>>>> Stashed changes
    setProgressInfo((prev) => ({
      ...prev,
      [taskType]: progressData,
    }));

<<<<<<< Updated upstream
    // Update collection status based on progress stage
=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    // For completed tasks
    if (progress.status === "complete") return 100;

    // For tasks with known percentage
=======
    if (progress.status === "complete") return 100;

>>>>>>> Stashed changes
    if (progress.progress?.completedPercentage) {
      return progress.progress.completedPercentage;
    }

<<<<<<< Updated upstream
    // For tasks in progress without percentage
    if (progress.status === "in_progress") {
      // If we have page info, use that for visual feedback
      if (progress.progress?.pageCount) {
        // Create a "bouncing" progress that never quite reaches 100%
        const base = Math.min(90, progress.progress.pageCount * 5);
        return base;
      }
      return 50; // Default to 50% if no other info
=======
    if (progress.status === "in_progress") {
      if (progress.progress?.pageCount) {
        const base = Math.min(90, progress.progress.pageCount * 5);
        return base;
      }
      return 50;
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    // Validate and set chunk count
=======
>>>>>>> Stashed changes
    if (value >= 2 && value <= 32) {
      setCustomChunkCount(value);
    }
  };

<<<<<<< Updated upstream
  // Empty component for tab controls (needed for TopBanner)
  const TabControls = () => <div></div>;

  if (loading && !bmsData) {
=======
  // Handle battery selection change
  const handleBatteryChange = async (batteryId) => {
    // Validate access to the selected battery
    const selectedOption = batteryOptions.find(
      (option) => option.batteryId === batteryId
    );
    if (!selectedOption) {
      toast.error("Invalid battery selection");
      return;
    }

    try {
      const hasAccess = await validateAccess(
        selectedOption.serialNumber,
        batteryId
      );
      if (!hasAccess) {
        toast.error("You don't have access to this battery");
        return;
      }

      setSelectedTagId(batteryId);

      // Update BMS state to reflect selected battery
      setBmsState({
        DeviceId: { N: batteryId },
        SerialNumber: { N: selectedOption.serialNumber },
        TagID: { S: `BAT-${batteryId}` },
      });

      // Clear any existing ML data for the previous selection
      setMlData(null);

      toast.success(`Selected battery: ${selectedOption.label}`);
    } catch (error) {
      console.error("Error validating battery access:", error);
      toast.error("Failed to validate battery access");
    }
  };

  // Navigate to registration if no batteries
  const goToRegistration = () => {
    navigate("/battery-registration");
  };

  // Empty component for tab controls
  const TabControls = () => <div></div>;

  if (loading && !bmsData && initialLoad) {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      {/* TopBanner replacing Sidebar */}
=======
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* TopBanner */}
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
      <div
        style={{
          flex: 1,
          backgroundColor: "#f2f2f2",
        }}
      >
=======
      <div style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
          {/* Check if user has no registered batteries */}
          {!hasActiveBatteries && !batteryLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                backgroundColor: "#fff3e0",
                borderRadius: "15px",
                border: "2px dashed #FF9800",
              }}
            >
              <div
                style={{
                  fontSize: "3rem",
                  marginBottom: "20px",
                  color: "#FF9800",
                }}
              >
                🤖
              </div>
              <h3
                style={{
                  fontSize: "1.2rem",
                  color: "#E65100",
                  marginBottom: "10px",
                }}
              >
                No Registered Batteries Found
              </h3>
              <p
                style={{
                  color: "#F57C00",
                  marginBottom: "20px",
                }}
              >
                You need to register at least one battery to access ML features.
              </p>
              <button
                onClick={goToRegistration}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#FF9800",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                  boxShadow: "0 2px 8px rgba(255, 152, 0, 0.3)",
                }}
              >
                Register Batteries
              </button>
            </div>
          ) : (
            <>
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
                    Registered Battery *:
                  </label>
                  {batteryLoading ? (
                    <div
                      style={{
                        padding: "10px 15px",
                        borderRadius: "25px",
                        border: "1px solid #e6e6e6",
                        backgroundColor: "#f9f9f9",
                        color: "#999999",
                      }}
                    >
                      Loading batteries...
                    </div>
                  ) : batteryOptions.length === 0 ? (
                    <div
                      style={{
                        padding: "10px 15px",
                        borderRadius: "25px",
                        border: "1px solid #F44336",
                        backgroundColor: "#ffebee",
                        color: "#F44336",
                      }}
                    >
                      No registered batteries found
                    </div>
                  ) : (
                    <select
                      value={selectedTagId || ""}
                      onChange={(e) => handleBatteryChange(e.target.value)}
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
                      <option value="">Select a battery...</option>
                      {batteryOptions.map((option) => (
                        <option key={option.batteryId} value={option.batteryId}>
                          {option.label}{" "}
                          {option.location && `(${option.location})`}
                        </option>
                      ))}
                    </select>
                  )}
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

              {/* Selected Battery Info */}
              {selectedTagId && (
                <div
                  style={{
                    backgroundColor: "#e8f5e9",
                    padding: "15px",
                    borderRadius: "10px",
                    marginBottom: "20px",
                    border: "1px solid #4CAF50",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      color: "#2E7D32",
                      fontSize: "1rem",
                    }}
                  >
                    Selected Battery for ML Processing
                  </h3>
                  <div style={{ fontSize: "14px", color: "#2E7D32" }}>
                    {(() => {
                      const selectedOption = batteryOptions.find(
                        (option) => option.batteryId === selectedTagId
                      );
                      return selectedOption ? (
                        <>
                          <strong>Name:</strong> {selectedOption.label} |{" "}
                          <strong>Serial:</strong> {selectedOption.serialNumber}{" "}
                          | <strong>ID:</strong> {selectedOption.batteryId}
                          {selectedOption.location && (
                            <span>
                              {" "}
                              | <strong>Location:</strong>{" "}
                              {selectedOption.location}
                            </span>
                          )}
                        </>
                      ) : (
                        `Battery ID: ${selectedTagId}`
                      );
                    })()}
                  </div>
                </div>
              )}

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
                    Data for {selectedTagId} with {selectedTimeRange} time range
                    is already cached. Tasks will use the cached data instead of
                    fetching again.
                  </div>
                </div>
              )}

              {/* Task Selection Grid - only show if battery is selected */}
              {selectedTagId && (
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
              )}

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
            </>
>>>>>>> Stashed changes
          )}
        </div>
      </div>
    </div>
  );
};

export default MLDashboardContainer;
