const TopBanner = ({ bmsState }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        padding: "16px 20px",
        borderRadius: "15px", // Rounded corners for OneUI
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        marginBottom: "20px",
        border: "1px solid #e6e6e6",
      }}
    >
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          color: "#1259c3", // OneUI primary blue
          fontFamily:
            "SamsungOne, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        Battery Management Dashboard
      </h1>
      <div
        style={{
          textAlign: "right",
          color: "#000000", // OneUI text color
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
