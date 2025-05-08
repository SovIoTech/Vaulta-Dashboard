import React from "react";

const CardItem = ({ label, value, icon, color }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
<<<<<<< HEAD
      border: "1px solid #e6e6e6",
      borderRadius: "15px", // Rounded corners for OneUI
      padding: "15px",
      margin: "10px 0",
      backgroundColor: "#ffffff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
=======
      border: "1px solid #e8e8e8",
      borderRadius: "12px",
      padding: "20px",
      margin: "5px",
      backgroundColor: "#ffffff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      flex: "1 1 calc(50% - 10px)",
      minWidth: "140px",
      transition: "box-shadow 0.2s ease",
      height: "90px",
>>>>>>> 3d3dcbab18667f2bf77a3c89df0d53ce8325d3d4
    }}
  >
    {icon && (
      <div
        style={{
<<<<<<< HEAD
          marginRight: "15px",
          color: color || "#1259c3", // Default to OneUI blue
          fontSize: "24px",
=======
          marginRight: "18px",
          color: color,
          fontSize: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          backgroundColor: `${color}15`, // 10% opacity of the color
>>>>>>> 3d3dcbab18667f2bf77a3c89df0d53ce8325d3d4
        }}
      >
        {icon}
      </div>
    )}
    <div>
<<<<<<< HEAD
      <div style={{ color: "#757575", fontSize: "14px" }}>{label}</div>
      <div style={{ fontWeight: "bold", fontSize: "16px", color: "#000000" }}>
=======
      <div
        style={{
          color: "#666666",
          fontSize: "14px",
          marginBottom: "6px",
          fontWeight: "600",
          letterSpacing: "0.3px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: "700",
          fontSize: "22px",
          color: "#333333",
          letterSpacing: "0.5px",
        }}
      >
>>>>>>> 3d3dcbab18667f2bf77a3c89df0d53ce8325d3d4
        {value}
      </div>
    </div>
  </div>
);

<<<<<<< HEAD
const Cards = ({ bmsState, roundValue }) => {
  const cardSections = [
    {
      title: "State of Charge",
      items: [
        {
          label: "Capacity (Ah)",
          value: roundValue(bmsState.SOCAh?.N || 0),
          icon: "⚡",
          color: "#1259c3", // OneUI blue
        },
        {
          label: "Battery Level",
          value: `${roundValue(bmsState.SOCPercent?.N || 0)}%`,
          icon: "%",
          color: "#1259c3", // OneUI blue
        },
      ],
    },
    {
      title: "Voltage Readings",
      items: [
        {
          label: "Load Voltage",
          value: `${roundValue(bmsState.TotalLoadVoltage?.N || 0)} V`,
          icon: "🔌",
          color: "#1259c3", // OneUI blue
        },
        {
          label: "Battery Voltage",
          value: `${roundValue(bmsState.TotalBattVoltage?.N || 0)} V`,
          icon: "🔋",
          color: "#4CAF50", // Green
        },
      ],
    },
    {
      title: "Current & Environmental Impact",
      items: [
        {
          label: "Total Current",
          value: `${roundValue(bmsState.TotalCurrent?.N || 0)} A`,
          icon: "⚡",
          color: "#FF9800", // Orange
        },
        {
          label: "Carbon Offset",
          value: `${roundValue(bmsState.Carbon_Offset_kg?.N || 0)} kg`,
          icon: "🌍",
          color: "#4CAF50", // Green
        },
      ],
=======
const Cards = ({ bmsState, roundValue, colors = {} }) => {
  // Use provided colors or fallback to default
  const cardColors = {
    primary: colors.primary || "#2a5bd7",
    secondary: colors.secondary || "#a0a0a0",
    accentGreen: colors.accentGreen || "#3a9b40",
    accentRed: colors.accentRed || "#e53935",
    highlight: colors.highlight || "#ffb300",
  };

  // Organize all card items into a single array to use with flex layout
  const cardItems = [
    // State of Charge Items
    {
      label: "Capacity (Ah)",
      value: roundValue(bmsState.SOCAh?.N || 0),
      icon: "",
      color: cardColors.primary,
    },
    {
      label: "Battery Level",
      value: `${roundValue(bmsState.SOCPercent?.N || 0)}%`,
      icon: "",
      color: cardColors.primary,
    },
    // Voltage Readings
    {
      label: "Load Voltage",
      value: `${roundValue(bmsState.TotalLoadVoltage?.N || 0)} V`,
      icon: "",
      color: cardColors.primary,
    },
    {
      label: "Battery Voltage",
      value: `${roundValue(bmsState.TotalBattVoltage?.N || 0)} V`,
      icon: "",
      color: cardColors.accentGreen,
    },
    // Current & Environmental Impact
    {
      label: "Total Current",
      value: `${roundValue(bmsState.TotalCurrent?.N || 0)} A`,
      icon: "",
      color: cardColors.highlight,
    },
    {
      label: "Carbon Offset",
      value: `${roundValue(bmsState.Carbon_Offset_kg?.N || 0)} kg`,
      icon: "",
      color: cardColors.accentGreen,
>>>>>>> 3d3dcbab18667f2bf77a3c89df0d53ce8325d3d4
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "20px",
        marginBottom: "20px",
      }}
    >
      {cardSections.map((section, index) => (
        <div
          key={index}
          style={{
            background: "#fff",
            borderRadius: "15px", // Rounded corners for OneUI
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
            padding: "20px",
            textAlign: "left",
          }}
        >
          <h3
            style={{
              fontWeight: "600",
              marginBottom: "15px",
              color: "#1259c3", // OneUI blue
              borderBottom: "2px solid #f2f2f2",
              paddingBottom: "10px",
            }}
          >
            {section.title}
          </h3>
          {section.items.map((item, i) => (
            <CardItem
              key={i}
              label={item.label}
              value={item.value}
              icon={item.icon}
              color={item.color}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Cards;
