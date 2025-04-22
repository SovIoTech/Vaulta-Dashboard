import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar.js";
import LoadingSpinner from "./LoadingSpinner.js";
import { collectMLData } from "./MLDataCollector.js";
import MLDataVisualization from "./MLDataVisualization.js";

// Progress bar component
const ProgressBar = ({ percentage, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "error": return "#F44336";  // Red for errors
      case "complete": return "#4CAF50";  // Green for completion
      case "in_progress": return "#1259c3";  // Blue for in progress
      default: return "#757575";  // Gray for unknown status
    }
  };

  return (
    <div style={{ 
      width: "100%", 
      backgroundColor: "#e0e0e0", 
      borderRadius: "4px",
      height: "8px",
      marginTop: "10px",
      marginBottom: "5px",
      overflow: "hidden"
    }}>
      <div style={{
        width: `${percentage || 0}%`,
        backgroundColor: getStatusColor(),
        height: "100%",
        borderRadius: "4px",
        transition: "width 0.3s ease"
      }} />
    </div>
  );
};

const MLDashboard = ({ signOut, bmsData }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mlData, setMlData] = useState(null);
  const [rawData, setRawData] = useState({}); // Cache for raw data by tagId and timeRange
  const [selectedTagId, setSelectedTagId] = useState("0x440");
  const [selectedTimeRange, setSelectedTimeRange] = useState("1month");
  const [activeTask, setActiveTask] = useState("batteryHealth");
  const [showRawData, setShowRawData] = useState(false);
  const [progressInfo, setProgressInfo] = useState({});
  const [dataCollectionStatus, setDataCollectionStatus] = useState({
    batteryHealth: "Not Started",
    anomalyDetection: "Not Started",
    energyOptimization: "Not Started",
    predictiveMaintenance: "Not Started"
  });
  const navigate = useNavigate();

  // Time range options for data collection
  const timeRanges = [
    { label: "Last 1 Month", value: "1month" },
    { label: "Last 3 Months", value: "3months" },
    { label: "Last 6 Months", value: "6months" },
    { label: "Last 1 Year", value: "1year" },
  ];

  // List of TagIDs (battery IDs)
  const baseIds = [
    "0x100", "0x140", "0x180", "0x1C0", "0x200", 
    "0x240", "0x280", "0x2C0", "0x400", "0x440",
    "0x480", "0x4C0", "0x500", "0x540", "0x580",
    "0x5C0", "0x600", "0x640", "0x680", "0x6C0",
    "0x740", "0x780",
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
    setProgressInfo(prev => ({
      ...prev,
      [taskType]: progressData
    }));
    
    // Update collection status based on progress stage
    if (progressData.status === "complete") {
      setDataCollectionStatus(prev => ({
        ...prev,
        [taskType]: "Completed"
      }));
    } else if (progressData.status === "error") {
      setDataCollectionStatus(prev => ({
        ...prev,
        [taskType]: "Failed"
      }));
    } else {
      setDataCollectionStatus(prev => ({
        ...prev,
        [taskType]: "In Progress"
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
        // This gives visual feedback without knowing the actual percentage
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

  // Process raw data for a specific task type
  const processDataForTask = (taskType, data) => {
    // Process data based on taskType using the same processing functions as in MLDataCollector
    switch (taskType) {
      case "batteryHealth":
        return { processBatteryHealthData: true, data }; // This would call processBatteryHealthData(data)
      case "anomalyDetection":
        return { processAnomalyData: true, data }; // This would call processAnomalyData(data)
      case "energyOptimization":
        return { processEnergyData: true, data }; // This would call processEnergyData(data)
      case "predictiveMaintenance":
        return { processMaintenanceData: true, data }; // This would call processMaintenanceData(data)
      default:
        return { error: "Unknown task type" };
    }
  };

  // Function to collect data for ML tasks
  const handleCollectData = async (taskType) => {
    const cacheKey = getCacheKey(selectedTagId, selectedTimeRange);
    
    // Check if we already have this data in cache
    if (rawData[cacheKey]) {
      console.log(`Using cached data for ${selectedTagId} with time range ${selectedTimeRange}`);
      
      // Update UI to show we're processing the cached data
      setProgressInfo(prev => ({
        ...prev,
        [taskType]: {
          stage: "processing",
          status: "in_progress",
          message: "Processing cached data..."
        }
      }));
      
      setDataCollectionStatus(prev => ({
        ...prev,
        [taskType]: "In Progress"
      }));
      
      try {
        setLoading(true);
        
        // Process the cached data for this specific task
        // Note: In a real implementation, you'd call the actual processing functions
        // For this example, we're simulating the processing with a timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate processed data result
        const processedResult = {
          meta: {
            tagId: selectedTagId,
            timeRange: selectedTimeRange,
            dataPoints: rawData[cacheKey].length,
            isFromCache: true
          },
          rawSampleData: rawData[cacheKey].slice(0, 5),
          processedData: processDataForTask(taskType, rawData[cacheKey])
        };
        
        // Update ML data with the processed result
        setMlData(prevData => ({
          ...prevData,
          [taskType]: processedResult
        }));
        
        // Set active task to the one just processed
        setActiveTask(taskType);
        
        // Update progress info to completed
        setProgressInfo(prev => ({
          ...prev,
          [taskType]: {
            stage: "completed",
            status: "complete",
            message: "Successfully processed cached data"
          }
        }));
        
        // Update collection status to completed
        setDataCollectionStatus(prev => ({
          ...prev,
          [taskType]: "Completed"
        }));
        
        console.log(`Successfully processed cached data for ${taskType}`);
      } catch (error) {
        console.error(`Error processing cached data for ${taskType}:`, error);
        
        // Final error state update
        setDataCollectionStatus(prev => ({
          ...prev,
          [taskType]: "Failed"
        }));
        
        setProgressInfo(prev => ({
          ...prev,
          [taskType]: {
            stage: "error",
            status: "error",
            message: `Error: ${error.message}`
          }
        }));
      } finally {
        setLoading(false);
      }
      
      return;
    }
    
    // No cached data, need to fetch from server
    // Reset progress info for this task
    setProgressInfo(prev => ({
      ...prev,
      [taskType]: {
        stage: "starting",
        status: "in_progress",
        message: "Starting data collection..."
      }
    }));
    
    setDataCollectionStatus(prev => ({
      ...prev,
      [taskType]: "In Progress"
    }));

    try {
      setLoading(true);
      
      // Call the specialized ML data collection function with progress callback
      const collectedData = await collectMLData(
        selectedTagId, 
        selectedTimeRange, 
        taskType,
        (progress) => handleProgressUpdate(taskType, progress)
      );
      
      // Cache the raw data for future use
      if (collectedData.rawData) {
        setRawData(prev => ({
          ...prev,
          [cacheKey]: collectedData.rawData
        }));
      }
      
      // Set the ML data for this specific task
      setMlData(prevData => ({
        ...prevData,
        [taskType]: collectedData
      }));
      
      // Set active task to the one just collected
      setActiveTask(taskType);
      
      console.log(`Successfully collected ${taskType} data:`, collectedData);
    } catch (error) {
      console.error(`Error collecting data for ${taskType}:`, error);
      
      // Final error state update
      setDataCollectionStatus(prev => ({
        ...prev,
        [taskType]: "Failed"
      }));
      
      setProgressInfo(prev => ({
        ...prev,
        [taskType]: {
          stage: "error",
          status: "error",
          message: `Error: ${error.message}`
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Card for displaying selected parameters
  const ParameterCard = ({ title, parameters }) => (
    <div style={{
      backgroundColor: "#f9f9f9",
      padding: "10px",
      borderRadius: "8px",
      margin: "10px 0"
    }}>
      <h4 style={{ margin: "0 0 10px 0", fontWeight: "500" }}>{title}</h4>
      <ul style={{ margin: 0, paddingLeft: "20px" }}>
        {parameters.map((param, index) => (
          <li key={index}>{param}</li>
        ))}
      </ul>
    </div>
  );

  // Status indicator component with progress
  const StatusIndicator = ({ taskType }) => {
    const status = dataCollectionStatus[taskType];
    const progress = progressInfo[taskType];
    
    const getStatusColor = () => {
      switch (status) {
        case "Completed": return "#4CAF50";
        case "In Progress": return "#FFC107";
        case "Failed": return "#F44336";
        default: return "#757575";
      }
    };

    return (
      <div style={{ marginTop: "10px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: getStatusColor(),
            marginRight: "8px"
          }}></div>
          <span>{status}</span>
          {hasCachedData() && status !== "In Progress" && status !== "Completed" && (
            <span style={{ 
              marginLeft: "10px", 
              fontSize: "12px", 
              backgroundColor: "#E1F5FE",
              color: "#0288D1",
              padding: "2px 6px",
              borderRadius: "4px"
            }}>
              Cached data available
            </span>
          )}
        </div>
        
        {/* Show progress bar for in-progress tasks */}
        {status === "In Progress" && (
          <>
            <ProgressBar 
              percentage={getProgressPercentage(taskType)} 
              status={progress?.status || "in_progress"} 
            />
            <div style={{ fontSize: "12px", color: "#666" }}>
              {progress?.message || "Processing..."}
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading && !bmsData) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f2f2f2",
      fontFamily: "SamsungOne, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        signOut={signOut}
        navigate={navigate}
      />
      <div style={{
        flex: 1,
        padding: "20px",
        backgroundColor: "#f2f2f2",
        maxWidth: "calc(100% - 80px)",
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          marginBottom: "20px",
        }}>
          <h1 style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            color: "#1259c3",
            marginBottom: "20px",
          }}>
            Machine Learning Data Collection
          </h1>

          {/* Data Collection Controls */}
          <div style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}>
            {/* Device Selection */}
            <div style={{
              flex: "1 1 200px",
              backgroundColor: "#f9f9f9",
              padding: "15px",
              borderRadius: "15px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <label style={{
                fontSize: "14px",
                color: "#757575",
                marginBottom: "8px",
                display: "block",
                fontWeight: "500",
              }}>
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
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>

            {/* Time Range Selection */}
            <div style={{
              flex: "1 1 200px",
              backgroundColor: "#f9f9f9",
              padding: "15px",
              borderRadius: "15px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <label style={{
                fontSize: "14px",
                color: "#757575",
                marginBottom: "8px",
                display: "block",
                fontWeight: "500",
              }}>
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
          </div>

          {/* Data Cache Status */}
          {hasCachedData() && (
            <div style={{
              backgroundColor: "#E8F5E9",
              color: "#2E7D32",
              padding: "10px 15px",
              borderRadius: "8px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <div style={{ fontWeight: "500" }}>✓</div>
              <div>
                Data for {selectedTagId} with {selectedTimeRange} time range is already cached. 
                Tasks will use the cached data instead of fetching again.
              </div>
            </div>
          )}

          {/* Four Sections Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "20px",
            marginTop: "30px",
          }}>
            {/* 1. Battery Health Prediction Section */}
            <div style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}>
              <h2 style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#1259c3",
                marginBottom: "15px",
                paddingBottom: "10px",
                borderBottom: "1px solid #e6e6e6",
              }}>
                Battery Health Prediction
              </h2>

              <p style={{ marginBottom: "15px", color: "#666666" }}>
                Predicts remaining useful life and capacity degradation based on historical patterns.
              </p>

              <ParameterCard 
                title="Required Parameters" 
                parameters={[
                  "Voltage patterns over time (min, max, avg)",
                  "Current draw patterns",
                  "Temperature fluctuations",
                  "Charge-discharge cycle count",
                  "State of Charge (SOC) history",
                  "Battery age"
                ]} 
              />

              <button
                onClick={() => handleCollectData("batteryHealth")}
                disabled={dataCollectionStatus.batteryHealth === "In Progress"}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1259c3",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  cursor: dataCollectionStatus.batteryHealth === "In Progress" ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  opacity: dataCollectionStatus.batteryHealth === "In Progress" ? 0.7 : 1,
                  marginTop: "15px",
                }}
              >
                {dataCollectionStatus.batteryHealth === "In Progress" ? "Collecting..." : 
                 hasCachedData() ? "Use Cached Data" : "Collect Data"}
              </button>

              <StatusIndicator taskType="batteryHealth" />
            </div>

            {/* 2. Anomaly Detection Section */}
            <div style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}>
              <h2 style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#1259c3",
                marginBottom: "15px",
                paddingBottom: "10px",
                borderBottom: "1px solid #e6e6e6",
              }}>
                Anomaly Detection
              </h2>

              <p style={{ marginBottom: "15px", color: "#666666" }}>
                Identifies unusual battery behavior that may indicate faults or safety issues.
              </p>

              <ParameterCard 
                title="Required Parameters" 
                parameters={[
                  "Real-time voltage, current, temperature",
                  "Internal resistance calculations",
                  "Rate of change in key parameters",
                  "Normal operation baseline data"
                ]} 
              />

              <button
                onClick={() => handleCollectData("anomalyDetection")}
                disabled={dataCollectionStatus.anomalyDetection === "In Progress"}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1259c3",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  cursor: dataCollectionStatus.anomalyDetection === "In Progress" ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  opacity: dataCollectionStatus.anomalyDetection === "In Progress" ? 0.7 : 1,
                  marginTop: "15px",
                }}
              >
                {dataCollectionStatus.anomalyDetection === "In Progress" ? "Collecting..." : 
                 hasCachedData() ? "Use Cached Data" : "Collect Data"}
              </button>

              <StatusIndicator taskType="anomalyDetection" />
            </div>

            {/* 3. Energy Optimization Section */}
            <div style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}>
              <h2 style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#1259c3",
                marginBottom: "15px",
                paddingBottom: "10px",
                borderBottom: "1px solid #e6e6e6",
              }}>
                Energy Optimization
              </h2>

              <p style={{ marginBottom: "15px", color: "#666666" }}>
                Predicts optimal charging/discharging cycles and forecasts energy demands.
              </p>

              <ParameterCard 
                title="Required Parameters" 
                parameters={[
                  "Time series of energy usage",
                  "Time of day, day of week patterns",
                  "Environmental factors (temperature)",
                  "Previous charging patterns",
                  "1+ year of historical usage data"
                ]} 
              />

              <button
                onClick={() => handleCollectData("energyOptimization")}
                disabled={dataCollectionStatus.energyOptimization === "In Progress"}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1259c3",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  cursor: dataCollectionStatus.energyOptimization === "In Progress" ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  opacity: dataCollectionStatus.energyOptimization === "In Progress" ? 0.7 : 1,
                  marginTop: "15px",
                }}
              >
                {dataCollectionStatus.energyOptimization === "In Progress" ? "Collecting..." : 
                 hasCachedData() ? "Use Cached Data" : "Collect Data"}
              </button>

              <StatusIndicator taskType="energyOptimization" />
            </div>

            {/* 4. Predictive Maintenance Section */}
            <div style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}>
              <h2 style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#1259c3",
                marginBottom: "15px",
                paddingBottom: "10px",
                borderBottom: "1px solid #e6e6e6",
              }}>
                Predictive Maintenance
              </h2>

              <p style={{ marginBottom: "15px", color: "#666666" }}>
                Schedules maintenance based on predicted failure patterns to reduce downtime.
              </p>

              <ParameterCard 
                title="Required Parameters" 
                parameters={[
                  "Statistical patterns in voltage/current",
                  "Cycle information",
                  "Temperature extremes and fluctuations",
                  "Charging efficiency metrics",
                  "Historical maintenance records"
                ]} 
              />

              <button
                onClick={() => handleCollectData("predictiveMaintenance")}
                disabled={dataCollectionStatus.predictiveMaintenance === "In Progress"}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1259c3",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  cursor: dataCollectionStatus.predictiveMaintenance === "In Progress" ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  opacity: dataCollectionStatus.predictiveMaintenance === "In Progress" ? 0.7 : 1,
                  marginTop: "15px",
                }}
              >
                {dataCollectionStatus.predictiveMaintenance === "In Progress" ? "Collecting..." : 
                 hasCachedData() ? "Use Cached Data" : "Collect Data"}
              </button>

              <StatusIndicator taskType="predictiveMaintenance" />
            </div>
          </div>

          {/* Data Visualization Section - Show when data is collected */}
          {mlData && Object.keys(mlData).some(key => mlData[key]) && (
            <div style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              marginTop: "30px",
            }}>
              <h2 style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#1259c3",
                marginBottom: "15px",
              }}>
                Data Analysis Results
              </h2>
              
              {/* Tabs for different task visualizations */}
              <div style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}>
                {Object.keys(mlData).map(taskKey => (
                  <button
                    key={taskKey}
                    onClick={() => setActiveTask(taskKey)}
                    style={{
                      padding: "8px 15px",
                      backgroundColor: activeTask === taskKey ? "#1259c3" : "#f0f0f0",
                      color: activeTask === taskKey ? "white" : "#333",
                      border: "none",
                      borderRadius: "20px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {taskKey === "batteryHealth" ? "Battery Health" : 
                     taskKey === "anomalyDetection" ? "Anomaly Detection" :
                     taskKey === "energyOptimization" ? "Energy Optimization" : 
                     taskKey === "predictiveMaintenance" ? "Predictive Maintenance" : 
                     taskKey}
                  </button>
                ))}
              </div>
              
              {/* Visualization panel */}
              <div style={{
                backgroundColor: "#f9f9f9",
                borderRadius: "10px",
                minHeight: "400px",
              }}>
                <MLDataVisualization 
                  data={mlData[activeTask]} 
                  taskType={activeTask} 
                />
              </div>
              
              {/* Raw data preview toggle */}
              <div style={{ marginTop: "20px" }}>
                <button
                  onClick={() => setShowRawData(!showRawData)}
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#f0f0f0",
                    color: "#333",
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {showRawData ? "Hide Raw Data" : "Show Raw Data"}
                </button>
                
                {showRawData && (
                  <div style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    padding: "15px",
                    marginTop: "15px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "10px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    whiteSpace: "pre-wrap"
                  }}>
                    {/* Show only the processed data for the active task rather than the full object */}
                    {JSON.stringify(
                      {
                        meta: mlData[activeTask]?.meta || {},
                        processedData: mlData[activeTask]?.processedData || {},
                        isFromCache: mlData[activeTask]?.meta?.isFromCache || false
                      }, 
                      null, 2
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MLDashboard;