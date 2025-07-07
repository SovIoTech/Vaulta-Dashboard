// src/app/components/BatteryRegistration.js
import React, { useState } from "react";
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
    registerBattery,
    deactivateBattery,
    loadBatteries,
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.serialNumber.trim()) {
      toast.error("Serial number is required");
      return;
    }

    setFormLoading(true);

    try {
      await registerBattery({
        serialNumber: formData.serialNumber.trim(),
        batteryId: formData.batteryId,
        batteryName: formData.batteryName.trim(),
        location: formData.location.trim(),
      });

      toast.success("Battery registered successfully!");

      // Reset form
      setFormData({
        serialNumber: "",
        batteryId: "0x440",
        batteryName: "",
        location: "",
      });

      setShowRegistrationForm(false);
    } catch (error) {
      toast.error(error.message || "Failed to register battery");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle battery deactivation
  const handleDeactivate = async (registrationId, batteryName) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${batteryName}" from your registered batteries?`
    );

    if (confirmed) {
      try {
        await deactivateBattery(registrationId);
        toast.success("Battery removed successfully!");
      } catch (error) {
        toast.error(error.message || "Failed to remove battery");
      }
    }
  };

  // Navigate to dashboard if user has batteries
  const goToDashboard = () => {
    if (hasRegistrations) {
      navigate("/dashboard");
    } else {
      toast.warning(
        "Please register at least one battery to access the dashboard"
      );
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
      <ToastContainer />

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

            <div style={{ display: "flex", gap: "10px" }}>
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

              {hasRegistrations && (
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
                  Go to Dashboard
                </button>
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
                        border: "1px solid #e6e6e6",
                        width: "100%",
                        fontSize: "14px",
                        color: "#000000",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                      }}
                    />
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
                        border: "1px solid #e6e6e6",
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
                      border: "1px solid #e6e6e6",
                      borderRadius: "15px",
                      padding: "20px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      position: "relative",
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

          {/* Error Display */}
          {error && (
            <div
              style={{
                backgroundColor: "#ffebee",
                color: "#F44336",
                padding: "15px",
                borderRadius: "10px",
                marginTop: "20px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatteryRegistration;
