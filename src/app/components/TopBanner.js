import { useState } from "react";

const TopBanner = ({ bmsState, baseIds }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        marginBottom: "20px",
        position: "relative",
        border: "1px solid #e0e0e0",
      }}
    >
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          color: "#696cff", // Sneat primary blue
          fontFamily:
            "Public Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        SovIoTech Solutions BMS Dashboard
      </h1>
      <div
        style={{
          textAlign: "right",
          color: "#566a7f", // Sneat text color
          fontSize: "0.9rem",
        }}
      >
        <p>Device ID: {bmsState.DeviceId?.N || "N/A"}</p>
        <p>Serial Number: {bmsState.SerialNumber?.N || "N/A"}</p>
        <p>Tag ID: {bmsState.TagID?.S || "N/A"}</p>
      </div>

      {/* Dropdown Menu */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "160px",
        }}
      >
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            background: "#696cff", // Sneat primary blue
            border: "none",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(105, 108, 255, 0.4)",
            transition: "all 0.3s ease",
          }}
          className="hover:bg-[#5a5eff]"
        >
          Select Base ID ▼
        </button>
        {isDropdownOpen && (
          <div
            style={{
              background: "white",
              border: "1px solid #e0e0e0",
              borderRadius: "5px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              marginTop: "5px",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {baseIds.map((baseId, index) => (
              <div
                key={index}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #e0e0e0",
                  color: "#566a7f",
                  transition: "background-color 0.2s ease",
                }}
                className="hover:bg-[#f5f5f9]"
                onClick={() => {
                  console.log("Selected Base ID:", baseId);
                  setIsDropdownOpen(false);
                }}
              >
                {baseId}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBanner;
