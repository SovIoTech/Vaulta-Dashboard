<<<<<<< Updated upstream:src/app/components/Page3.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBanner from "./TopBanner.js";
import { fetchData } from "./DataFetcher.js";
import DataViewer from "./DataViewer.js";
import LoadingSpinner from "./LoadingSpinner.js";
=======
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataViewer from "./DataViewer.js";
import { fetchData } from "../../queries.js";
import { useBatteryRegistration } from "../../services/batteryRegistrationService.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
>>>>>>> Stashed changes:src/app/components/DataAnalytics.js

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
<<<<<<< Updated upstream:src/app/components/Page3.js
  const [selectedTagId, setSelectedTagId] = useState("0x440");
=======
  const navigate = useNavigate();

  // Battery registration integration
  const {
    batteries,
    validateAccess,
    hasActiveBatteries,
    loading: batteryLoading,
  } = useBatteryRegistration();

  const [selectedTagId, setSelectedTagId] = useState("0x480");
>>>>>>> Stashed changes:src/app/components/DataAnalytics.js
  const [selectedTimeRange, setSelectedTimeRange] = useState("1hour");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
<<<<<<< Updated upstream:src/app/components/Page3.js
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const [bmsState, setBmsState] = useState({
    DeviceId: { N: "ANALYTICS-DEVICE" },
    SerialNumber: { N: "12345678" },
    TagID: { S: "BAT-ANALYTICS" },
  });
=======
  const [batteryOptions, setBatteryOptions] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
>>>>>>> Stashed changes:src/app/components/DataAnalytics.js

  // Original baseIds as fallback
  const originalBaseIds = [
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

<<<<<<< Updated upstream:src/app/components/Page3.js
=======
  // Load battery options when batteries change
  useEffect(() => {
    try {
      // Filter active batteries and create options
      const options = batteries
        .filter((battery) => battery.isActive === true)
        .map((battery) => ({
          value: battery.batteryId,
          label:
            battery.batteryName ||
            `${battery.serialNumber} - ${battery.batteryId}`,
          serialNumber: battery.serialNumber,
          batteryId: battery.batteryId,
          location: battery.location,
          registrationId: battery.registrationId,
        }));

      setBatteryOptions(options);

      if (initialLoad && options.length === 0 && !batteryLoading) {
        toast.warning(
          "You need to register batteries first to access analytics"
        );
        setInitialLoad(false);
      } else if (initialLoad && options.length > 0) {
        setInitialLoad(false);
      }
    } catch (error) {
      console.error("Error loading battery options:", error);
      toast.error("Failed to load your registered batteries");
    }
  }, [batteries, batteryLoading, initialLoad]);

  // Get the battery IDs to show in dropdown (user's batteries or fallback to original)
  const availableBatteryIds =
    batteryOptions.length > 0
      ? batteryOptions.map((option) => option.batteryId)
      : originalBaseIds;

  // Data fetcher using consolidated queries.js with access validation
>>>>>>> Stashed changes:src/app/components/DataAnalytics.js
  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      // If user has registered batteries, validate access
      if (batteryOptions.length > 0) {
        if (!selectedTagId) {
          throw new Error("Please select a registered battery");
        }

        const selectedBattery = batteryOptions.find(
          (option) => option.batteryId === selectedTagId
        );

        if (!selectedBattery) {
          throw new Error("Please select a valid registered battery");
        }

        // Validate user has access to this battery
        const hasAccess = await validateAccess(
          selectedBattery.serialNumber,
          selectedBattery.batteryId
        );

        if (!hasAccess) {
          throw new Error(
            "You don't have access to this battery. Please check if it's still active in your registrations."
          );
        }

        toast.success(
          `Analyzing data for ${
            selectedBattery.label || selectedBattery.batteryId
          }`
        );
      } else if (!selectedTagId) {
        throw new Error("Please select a device ID");
      }

      const fetchedData = await fetchData(selectedTagId, selectedTimeRange);
      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      const errorMessage =
        error.message || "Failed to fetch data. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< Updated upstream:src/app/components/Page3.js
  const TabControls = () => <div></div>;
=======
  // Navigate to registration if no batteries
  const goToRegistration = () => {
    navigate("/battery-registration");
  };

  // If we have data, show the grid layout
  if (data || loading || error) {
    return (
      <>
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
        <DataViewer
          loading={loading}
          error={error}
          data={data}
          selectedTagId={selectedTagId}
          setSelectedTagId={setSelectedTagId}
          onFetchData={handleFetchData}
          baseIds={availableBatteryIds}
        />
      </>
    );
  }
>>>>>>> Stashed changes:src/app/components/DataAnalytics.js

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
<<<<<<< Updated upstream:src/app/components/Page3.js
      {/* TopBanner - You might want to style this component separately */}
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
>>>>>>> Stashed changes:src/app/components/DataAnalytics.js

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
<<<<<<< Updated upstream:src/app/components/Page3.js
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
=======
          {/* Check if user has no registered batteries */}
          {!hasActiveBatteries && !batteryLoading ? (
>>>>>>> Stashed changes:src/app/components/DataAnalytics.js
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                backgroundColor: colors.background,
                borderRadius: "12px",
                border: `2px dashed ${colors.error}`,
                maxWidth: "600px",
                width: "100%",
              }}
            >
<<<<<<< Updated upstream:src/app/components/Page3.js
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
=======
              <div
                style={{
                  fontSize: "4rem",
                  marginBottom: "20px",
                  color: colors.error,
                }}
              >
                ⚠️
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  color: colors.textDark,
                  marginBottom: "10px",
                  fontWeight: "700",
                }}
              >
                No Registered Batteries Found
              </h3>
              <p
                style={{
                  color: colors.textLight,
                  marginBottom: "30px",
                  fontSize: "1.1rem",
                  lineHeight: "1.5",
                }}
              >
                You need to register at least one battery to access analytics
                features.
              </p>
>>>>>>> Stashed changes:src/app/components/DataAnalytics.js
              <button
                onClick={goToRegistration}
                style={{
<<<<<<< Updated upstream:src/app/components/Page3.js
                  padding: "12px 24px",
                  backgroundColor: colors.primary,
                  color: "#fff",
=======
                  padding: "16px 32px",
                  backgroundColor: colors.error,
                  color: "white",
>>>>>>> Stashed changes:src/app/components/DataAnalytics.js
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
<<<<<<< Updated upstream:src/app/components/Page3.js
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  opacity: loading ? 0.7 : 1,
                  pointerEvents: loading ? "none" : "auto",
=======
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = colors.textDark;
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = colors.error;
                  e.target.style.transform = "translateY(0)";
>>>>>>> Stashed changes:src/app/components/DataAnalytics.js
                }}
                disabled={loading}
              >
<<<<<<< Updated upstream:src/app/components/Page3.js
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
=======
                Register Batteries
              </button>
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "40px",
                }}
              >
                <h1
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "700",
                    color: colors.textDark,
                    margin: "0 0 16px 0",
                    letterSpacing: "0.5px",
                  }}
                >
                  Battery Data Analytics
                </h1>
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: colors.textLight,
                    margin: 0,
                  }}
                >
                  {batteryOptions.length > 0
                    ? "Select from your registered batteries and time range to analyze performance"
                    : "Select device and time range to analyze battery performance"}
                </p>
              </div>

              {/* Battery Registration Status */}
              {batteryOptions.length > 0 && (
                <div
                  style={{
                    backgroundColor: colors.background,
                    padding: "15px 20px",
                    borderRadius: "8px",
                    border: `1px solid ${colors.accent}`,
                    marginBottom: "30px",
                    textAlign: "center",
                    maxWidth: "600px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: colors.textDark,
                      fontWeight: "600",
                    }}
                  >
                    ✓ You have {batteryOptions.length} registered batter
                    {batteryOptions.length === 1 ? "y" : "ies"} available for
                    analysis
                  </div>
                </div>
              )}

              {/* Controls Section */}
>>>>>>> Stashed changes:src/app/components/DataAnalytics.js
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
<<<<<<< Updated upstream:src/app/components/Page3.js
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
=======
                  gap: "30px",
                  width: "100%",
                  maxWidth: "600px",
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
                        fontSize: "1rem",
                        color: colors.textDark,
                        marginBottom: "8px",
                        display: "block",
                        fontWeight: "600",
                      }}
                    >
                      {batteryOptions.length > 0
                        ? "Registered Battery:"
                        : "Device ID:"}
                    </label>
                    {batteryLoading ? (
                      <div
                        style={{
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: `2px solid ${colors.secondary}`,
                          backgroundColor: colors.background,
                          color: colors.textLight,
                          fontSize: "1rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            border: `2px solid ${colors.secondary}`,
                            borderTop: `2px solid ${colors.accent}`,
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        ></div>
                        Loading batteries...
                      </div>
                    ) : (
                      <select
                        value={selectedTagId}
                        onChange={(e) => setSelectedTagId(e.target.value)}
                        style={{
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: `2px solid ${colors.secondary}`,
                          width: "100%",
                          fontSize: "1rem",
                          color: colors.textDark,
                          backgroundColor: "#fff",
                          cursor: "pointer",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                        }}
                      >
                        {batteryOptions.length > 0 ? (
                          <>
                            <option value="">
                              Select a registered battery...
                            </option>
                            {batteryOptions.map((option) => (
                              <option
                                key={option.batteryId}
                                value={option.batteryId}
                              >
                                {option.label}{" "}
                                {option.location && `(${option.location})`}
                              </option>
                            ))}
                          </>
                        ) : (
                          <>
                            <option value="">
                              No registered batteries available
                            </option>
                            {originalBaseIds.map((id) => (
                              <option key={id} value={id}>
                                {id}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    )}
                  </div>

                  {/* Time Range Dropdown */}
                  <div style={{ flex: 1, minWidth: "250px" }}>
                    <label
                      style={{
                        fontSize: "1rem",
                        color: colors.textDark,
                        marginBottom: "8px",
                        display: "block",
                        fontWeight: "600",
                      }}
                    >
                      Time Period:
                    </label>
                    <select
                      value={selectedTimeRange}
                      onChange={(e) => setSelectedTimeRange(e.target.value)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: `2px solid ${colors.secondary}`,
                        width: "100%",
                        fontSize: "1rem",
                        color: colors.textDark,
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        outline: "none",
                        transition: "border-color 0.2s ease",
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

                {/* Selected Battery Info */}
                {batteryOptions.length > 0 &&
                  selectedTagId &&
                  batteryOptions.some(
                    (option) => option.batteryId === selectedTagId
                  ) && (
                    <div
                      style={{
                        backgroundColor: colors.background,
                        padding: "15px 20px",
                        borderRadius: "8px",
                        border: `1px solid ${colors.accent}`,
                        textAlign: "center",
                      }}
                    >
                      {(() => {
                        const selectedBattery = batteryOptions.find(
                          (option) => option.batteryId === selectedTagId
                        );
                        return selectedBattery ? (
                          <div
                            style={{
                              fontSize: "0.9rem",
                              color: colors.textDark,
                            }}
                          >
                            <strong>Selected:</strong> {selectedBattery.label} |
                            <strong> Serial:</strong>{" "}
                            {selectedBattery.serialNumber} |
                            <strong> ID:</strong> {selectedBattery.batteryId}
                            {selectedBattery.location && (
                              <span>
                                {" "}
                                | <strong>Location:</strong>{" "}
                                {selectedBattery.location}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div
                            style={{
                              fontSize: "0.9rem",
                              color: colors.textLight,
                            }}
                          >
                            Battery ID: {selectedTagId}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                {/* Analyze Button */}
                <div style={{ textAlign: "center" }}>
                  <button
                    onClick={handleFetchData}
                    disabled={batteryLoading}
                    style={{
                      padding: "16px 32px",
                      backgroundColor: batteryLoading
                        ? colors.secondary
                        : colors.accent,
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: batteryLoading ? "not-allowed" : "pointer",
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      opacity: batteryLoading ? 0.6 : 1,
                    }}
                    onMouseOver={(e) => {
                      if (!batteryLoading) {
                        e.target.style.backgroundColor = colors.primary;
                        e.target.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!batteryLoading) {
                        e.target.style.backgroundColor = colors.accent;
                        e.target.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {batteryLoading ? "Loading..." : "Analyze Data"}
                  </button>
                </div>

                {/* Info Section */}
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    backgroundColor: colors.background,
                    borderRadius: "8px",
                    border: `1px solid ${colors.secondary}`,
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: colors.textDark,
                      margin: "0 0 8px 0",
                    }}
                  >
                    What you'll see:
                  </h3>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: colors.textLight,
                      margin: 0,
                      lineHeight: "1.5",
                    }}
                  >
                    Interactive grid dashboard with cell data, pack information,
                    temperature readings, SOC metrics, and real-time trend
                    analysis for comprehensive battery monitoring.
                  </p>
                </div>
              </div>
            </>
          )}
>>>>>>> Stashed changes:src/app/components/DataAnalytics.js
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
