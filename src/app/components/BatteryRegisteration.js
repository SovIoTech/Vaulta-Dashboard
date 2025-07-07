// src/app/components/BatteryRegistration.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBanner from "./TopBanner.js";
import { useBatteryRegistration } from "../../services/batteryRegistrationService.js";
import LoadingSpinner from "./LoadingSpinner.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BatteryRegistration = () => {
  const navigate = useNavigate();
  const {
    batteries,
    loading,
    error,
    hasRegistrations,
    hasActiveBatteries,
    registerBattery,
    deactivateBattery,
    loadBatteries,
    clearError,
  } = useBatteryRegistration();

  const [darkMode, setDarkMode] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({
    serialNumber: "",
    batteryId: "0x440",
    batteryName: "",
    location: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Available battery IDs
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

  // Placeholder bmsState for TopBanner
  const bmsState = {
    DeviceId: { N: "REGISTRATION-DEVICE" },
    SerialNumber: { N: "12345678" },
    TagID: { S: "BAT-REGISTRATION" },
  };

  // Clear error when component mounts or when starting new actions
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Show toast when there's an error from the hook
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.serialNumber.trim()) {
      errors.serialNumber = "Serial number is required";
    } else if (formData.serialNumber.trim().length < 3) {
      errors.serialNumber = "Serial number must be at least 3 characters";
    }

    if (!formData.batteryId) {
      errors.batteryId = "Battery ID is required";
    }

    // Check for duplicate serial number + battery ID combination
    const isDuplicate = batteries.some(
      (battery) =>
        battery.serialNumber === formData.serialNumber.trim() &&
        battery.batteryId === formData.batteryId &&
        battery.isActive === true
    );

    if (isDuplicate) {
      errors.duplicate = "This battery is already registered and active";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormLoading(true);
    clearError();

    try {
      const result = await registerBattery({
        serialNumber: formData.serialNumber.trim(),
        batteryId: formData.batteryId,
        batteryName: formData.batteryName.trim(),
        location: formData.location.trim(),
      });

      toast.success(result.message || "Battery registered successfully!");

      // Reset form
      setFormData({
        serialNumber: "",
        batteryId: "0x440",
        batteryName: "",
        location: "",
      });
      setFormErrors({});
      setShowRegistrationForm(false);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register battery");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle battery deactivation
  const handleDeactivate = async (registrationId, batteryName) => {
    const batteryDisplayName = batteryName || "this battery";
    const confirmed = window.confirm(
      `Are you sure you want to remove "${batteryDisplayName}" from your registered batteries? This action will restrict access to this battery's data.`
    );

    if (confirmed) {
      try {
        const result = await deactivateBattery(registrationId);
        toast.success(result.message || "Battery removed successfully!");
      } catch (error) {
        console.error("Deactivation error:", error);
        toast.error(error.message || "Failed to remove battery");
      }
    }
  };

  // Navigate to dashboard if user has active batteries
  const goToDashboard = () => {
    if (hasActiveBatteries) {
      navigate("/dashboard");
    } else {
      toast.warning(
        "Please register at least one battery to access the dashboard"
      );
    }
  };

  // Navigate to analytics page
  const goToAnalytics = () => {
    if (hasActiveBatteries) {
      navigate("/page3");
    } else {
      toast.warning("Please register at least one battery to access analytics");
    }
  };

  // Refresh battery list
  const handleRefresh = async () => {
    try {
      await loadBatteries();
      toast.success("Battery list refreshed");
    } catch (error) {
      toast.error("Failed to refresh battery list");
    }
  };

  // Empty component for tab controls
  const TabControls = () => <div></div>;

  if (loading && batteries.length === 0) {
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
      <TopBanner
        user={{ username: "User" }}
        bmsState={bmsState}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lastUpdate={new Date()}
        isUpdating={loading}
      >
        <TabControls />
      </TopBanner>

      <div style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
        {/* Main Content */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              borderBottom: "1px solid #e0e0e0",
              paddingBottom: "10px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#1259c3",
                margin: 0,
              }}
            >
              Battery Registration
            </h1>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={handleRefresh}
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#757575",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {loading ? "..." : "🔄 Refresh"}
              </button>

              <button
                onClick={() => setShowRegistrationForm(!showRegistrationForm)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                }}
              >
                {showRegistrationForm ? "Cancel" : "+ Register New Battery"}
              </button>

              {hasActiveBatteries && (
                <>
                  <button
                    onClick={goToAnalytics}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#FF9800",
                      color: "white",
                      border: "none",
                      borderRadius: "25px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      boxShadow: "0 2px 8px rgba(255, 152, 0, 0.3)",
                    }}
                  >
                    Analytics
                  </button>

                  <button
                    onClick={goToDashboard}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#1259c3",
                      color: "white",
                      border: "none",
                      borderRadius: "25px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      boxShadow: "0 2px 8px rgba(18, 89, 195, 0.3)",
                    }}
                  >
                    Dashboard
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Registration Form */}
          {showRegistrationForm && (
            <div
              style={{
                backgroundColor: "#f9f9f9",
                padding: "20px",
                borderRadius: "15px",
                marginBottom: "30px",
                border: "1px solid #e6e6e6",
              }}
            >
              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  color: "#1259c3",
                  marginBottom: "20px",
                }}
              >
                Register New Battery
              </h2>

              {formErrors.duplicate && (
                <div
                  style={{
                    backgroundColor: "#ffebee",
                    color: "#F44336",
                    padding: "10px 15px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    fontSize: "14px",
                  }}
                >
                  {formErrors.duplicate}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "20px",
                    marginBottom: "20px",
                  }}
                >
                  {/* Serial Number */}
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        color: "#757575",
                        marginBottom: "8px",
                        display: "block",
                        fontWeight: "500",
                      }}
                    >
                      Serial Number *
                    </label>
                    <input
                      type="text"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleInputChange}
                      placeholder="Enter battery serial number"
                      required
                      style={{
                        padding: "12px 15px",
                        borderRadius: "25px",
                        border: `1px solid ${
                          formErrors.serialNumber ? "#F44336" : "#e6e6e6"
                        }`,
                        width: "100%",
                        fontSize: "14px",
                        color: "#000000",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                      }}
                    />
                    {formErrors.serialNumber && (
                      <div
                        style={{
                          color: "#F44336",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {formErrors.serialNumber}
                      </div>
                    )}
                  </div>

                  {/* Battery ID */}
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        color: "#757575",
                        marginBottom: "8px",
                        display: "block",
                        fontWeight: "500",
                      }}
                    >
                      Battery ID *
                    </label>
                    <select
                      name="batteryId"
                      value={formData.batteryId}
                      onChange={handleInputChange}
                      style={{
                        padding: "12px 15px",
                        borderRadius: "25px",
                        border: `1px solid ${
                          formErrors.batteryId ? "#F44336" : "#e6e6e6"
                        }`,
                        width: "100%",
                        fontSize: "14px",
                        color: "#000000",
                        backgroundColor: "#ffffff",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      }}
                    >
                      {baseIds.map((id) => (
                        <option key={id} value={id}>
                          {id}
                        </option>
                      ))}
                    </select>
                    {formErrors.batteryId && (
                      <div
                        style={{
                          color: "#F44336",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {formErrors.batteryId}
                      </div>
                    )}
                  </div>

                  {/* Battery Name */}
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        color: "#757575",
                        marginBottom: "8px",
                        display: "block",
                        fontWeight: "500",
                      }}
                    >
                      Battery Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="batteryName"
                      value={formData.batteryName}
                      onChange={handleInputChange}
                      placeholder="e.g., Main Battery Pack"
                      style={{
                        padding: "12px 15px",
                        borderRadius: "25px",
                        border: "1px solid #e6e6e6",
                        width: "100%",
                        fontSize: "14px",
                        color: "#000000",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        color: "#757575",
                        marginBottom: "8px",
                        display: "block",
                        fontWeight: "500",
                      }}
                    >
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Building A - Floor 2"
                      style={{
                        padding: "12px 15px",
                        borderRadius: "25px",
                        border: "1px solid #e6e6e6",
                        width: "100%",
                        fontSize: "14px",
                        color: "#000000",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <button
                    type="submit"
                    disabled={formLoading}
                    style={{
                      padding: "12px 30px",
                      backgroundColor: formLoading ? "#cccccc" : "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "25px",
                      cursor: formLoading ? "not-allowed" : "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                      boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                    }}
                  >
                    {formLoading ? "Registering..." : "Register Battery"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Registered Batteries List */}
          <div>
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#1259c3",
                marginBottom: "20px",
              }}
            >
              My Registered Batteries ({batteries.length})
            </h2>

            {!hasRegistrations ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "15px",
                  border: "2px dashed #e6e6e6",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "20px",
                    color: "#cccccc",
                  }}
                >
                  🔋
                </div>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    color: "#757575",
                    marginBottom: "10px",
                  }}
                >
                  No Batteries Registered
                </h3>
                <p
                  style={{
                    color: "#999999",
                    marginBottom: "20px",
                  }}
                >
                  You need to register at least one battery to access the
                  dashboard and view battery data.
                </p>
                <button
                  onClick={() => setShowRegistrationForm(true)}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "25px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                    boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                  }}
                >
                  Register Your First Battery
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {batteries.map((battery) => (
                  <div
                    key={battery.registrationId}
                    style={{
                      backgroundColor: "#ffffff",
                      border: `1px solid ${
                        battery.isActive ? "#e6e6e6" : "#ffcdd2"
                      }`,
                      borderRadius: "15px",
                      padding: "20px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      position: "relative",
                      opacity: battery.isActive ? 1 : 0.7,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: battery.isActive
                          ? "#4CAF50"
                          : "#F44336",
                        title: battery.isActive ? "Active" : "Inactive",
                      }}
                    ></div>

                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "#1259c3",
                        marginBottom: "15px",
                      }}
                    >
                      {battery.batteryName || `Battery ${battery.batteryId}`}
                    </h3>

                    <div style={{ marginBottom: "15px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ color: "#757575", fontWeight: "500" }}>
                          Serial Number:
                        </span>
                        <span style={{ color: "#000000", fontWeight: "600" }}>
                          {battery.serialNumber}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ color: "#757575", fontWeight: "500" }}>
                          Battery ID:
                        </span>
                        <span style={{ color: "#000000", fontWeight: "600" }}>
                          {battery.batteryId}
                        </span>
                      </div>

                      {battery.location && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <span style={{ color: "#757575", fontWeight: "500" }}>
                            Location:
                          </span>
                          <span style={{ color: "#000000" }}>
                            {battery.location}
                          </span>
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ color: "#757575", fontWeight: "500" }}>
                          Registered:
                        </span>
                        <span style={{ color: "#000000" }}>
                          {new Date(
                            battery.registrationDate
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ color: "#757575", fontWeight: "500" }}>
                          Status:
                        </span>
                        <span
                          style={{
                            color: battery.isActive ? "#4CAF50" : "#F44336",
                            fontWeight: "600",
                          }}
                        >
                          {battery.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {battery.isActive && (
                      <button
                        onClick={() =>
                          handleDeactivate(
                            battery.registrationId,
                            battery.batteryName ||
                              `${battery.serialNumber} - ${battery.batteryId}`
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "8px 16px",
                          backgroundColor: "#F44336",
                          color: "white",
                          border: "none",
                          borderRadius: "20px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        Remove Battery
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryRegistration;
