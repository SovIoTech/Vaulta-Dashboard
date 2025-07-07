// src/app/components/BatterySelector.js
import React, { useState, useEffect } from "react";
import { useBatteryRegistration } from "../../services/batteryRegistrationService.js";

const BatterySelector = ({
  selectedBattery,
  onBatteryChange,
  label = "Select Battery",
  placeholder = "Select a battery...",
  style = {},
  required = true,
  disabled = false,
  showLocation = true,
  showDetails = true,
  onError = null,
  validateAccess = false, // Whether to validate battery access on selection
}) => {
  const {
    getAccessibleOptions,
    loading: batteryLoading,
    validateAccess: checkAccess,
  } = useBatteryRegistration();
  const [batteryOptions, setBatteryOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load battery options
  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      setError(null);

      try {
        const options = getAccessibleOptions();
        setBatteryOptions(options);

        // Auto-select first option if none selected and options available
        if (!selectedBattery && options.length > 0 && onBatteryChange) {
          onBatteryChange(options[0]);
        }
      } catch (err) {
        console.error("Error loading battery options:", err);
        setError("Failed to load batteries");
        if (onError) {
          onError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [selectedBattery, onBatteryChange, getAccessibleOptions, onError]);

  // Handle battery selection with optional access validation
  const handleBatteryChange = async (e) => {
    const selectedValue = e.target.value;
    if (!selectedValue) {
      onBatteryChange(null);
      return;
    }

    const selected = batteryOptions.find(
      (option) => option.value === selectedValue
    );
    if (!selected) {
      setError("Invalid battery selection");
      return;
    }

    // Validate access if required
    if (validateAccess) {
      try {
        const hasAccess = await checkAccess(
          selected.serialNumber,
          selected.batteryId
        );
        if (!hasAccess) {
          setError("You don't have access to this battery");
          if (onError) {
            onError(new Error("Access denied to battery"));
          }
          return;
        }
      } catch (err) {
        console.error("Error validating battery access:", err);
        setError("Failed to validate battery access");
        if (onError) {
          onError(err);
        }
        return;
      }
    }

    setError(null);
    onBatteryChange(selected);
  };

  const isLoading = loading || batteryLoading;

  return (
    <div style={style}>
      <label
        style={{
          fontSize: "14px",
          color: "#757575",
          marginBottom: "8px",
          display: "block",
          fontWeight: "500",
        }}
      >
        {label} {required && "*"}
      </label>

      {isLoading ? (
        <div
          style={{
            padding: "12px 15px",
            borderRadius: "25px",
            border: "1px solid #e6e6e6",
            backgroundColor: "#f9f9f9",
            color: "#999999",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid #e6e6e6",
              borderTop: "2px solid #1259c3",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          Loading batteries...
        </div>
      ) : error ? (
        <div
          style={{
            padding: "12px 15px",
            borderRadius: "25px",
            border: "1px solid #F44336",
            backgroundColor: "#ffebee",
            color: "#F44336",
          }}
        >
          {error}
        </div>
      ) : batteryOptions.length === 0 ? (
        <div
          style={{
            padding: "12px 15px",
            borderRadius: "25px",
            border: "1px solid #FF9800",
            backgroundColor: "#fff3e0",
            color: "#F57C00",
          }}
        >
          No registered batteries found
        </div>
      ) : (
        <select
          value={selectedBattery?.value || ""}
          onChange={handleBatteryChange}
          disabled={disabled || isLoading}
          style={{
            padding: "12px 15px",
            borderRadius: "25px",
            border: "1px solid #e6e6e6",
            width: "100%",
            fontSize: "14px",
            color: disabled ? "#999999" : "#000000",
            backgroundColor: disabled ? "#f5f5f5" : "#ffffff",
            cursor: disabled ? "not-allowed" : "pointer",
            boxSizing: "border-box",
            opacity: disabled ? 0.6 : 1,
          }}
          required={required}
        >
          <option value="">{placeholder}</option>
          {batteryOptions.map((option) => (
            <option
              key={`${option.serialNumber}-${option.value}`}
              value={option.value}
            >
              {option.label}
              {showLocation && option.location && ` (${option.location})`}
            </option>
          ))}
        </select>
      )}

      {/* Additional battery info display */}
      {selectedBattery && showDetails && (
        <div
          style={{
            marginTop: "8px",
            padding: "8px 12px",
            backgroundColor: "#f0f8f0",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#2E7D32",
            border: "1px solid #c8e6c9",
          }}
        >
          <div>
            <strong>Serial:</strong> {selectedBattery.serialNumber} |
            <strong> ID:</strong> {selectedBattery.batteryId}
            {selectedBattery.location && (
              <span>
                {" "}
                | <strong>Location:</strong> {selectedBattery.location}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Spinner CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BatterySelector;
