const TopBanner = ({ bmsState }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        padding: "5px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        marginBottom: "20px",
        border: "1px solid #e0e0e0",
      }}
    >
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          color: "#696cff", // CoreUI primary blue
          fontFamily:
            "Public Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        SovIoTech Solutions BMS Dashboard
      </h1>
      <div
        style={{
          textAlign: "right",
          color: "#566a7f", // CoreUI text color
          fontSize: "0.9rem",
        }}
      >
        <p>Device ID: {bmsState.DeviceId?.N || "N/A"}</p>
        <p>Serial Number: {bmsState.SerialNumber?.N || "N/A"}</p>
        <p>Tag ID: {bmsState.TagID?.S || "N/A"}</p>
      </div>
    </div>
  );
};

export default TopBanner;
