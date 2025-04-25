import React from "react";

const CardItem = ({ label, value, icon, color }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      border: "1px solid #e6e6e6",
      borderRadius: "10px",
      padding: "15px",
      margin: "5px",
      backgroundColor: "#ffffff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      flex: "1 1 calc(50% - 10px)",
      minWidth: "120px",
    }}
  >
    {icon && (
      <div
        style={{
          marginRight: "15px",
          color: color,
          fontSize: "24px", // Increased icon size
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px", // Increased width
          height: "36px", // Increased height
        }}
      >
        {icon}
      </div>
    )}
    <div>
      <div
        style={{
          color: "#757575",
          fontSize: "15px", // Increased label font size
          marginBottom: "4px",
          fontWeight: "500",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: "bold",
          fontSize: "20px", // Increased value font size
          color: "#000000",
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

const Cards = ({ bmsState, roundValue, colors = {} }) => {
  // Use provided colors or fallback to default
  const cardColors = {
    primary: colors.primary || "#1259c3",
    secondary: colors.secondary || "#c0c0c0",
    accentGreen: colors.accentGreen || "#4CAF50",
    accentRed: colors.accentRed || "#F44336",
    highlight: colors.highlight || "#FFC107",
  };

  // Organize all card items into a single array to use with flex layout
  const cardItems = [
    // State of Charge Items
    {
      label: "Capacity (Ah)",
      value: roundValue(bmsState.SOCAh?.N || 0),
      icon: "⚡",
      color: cardColors.primary,
    },
    {
      label: "Battery Level",
      value: `${roundValue(bmsState.SOCPercent?.N || 0)}%`,
      icon: "%",
      color: cardColors.primary,
    },
    // Voltage Readings
    {
      label: "Load Voltage",
      value: `${roundValue(bmsState.TotalLoadVoltage?.N || 0)} V`,
      icon: "🔌",
      color: cardColors.primary,
    },
    {
      label: "Battery Voltage",
      value: `${roundValue(bmsState.TotalBattVoltage?.N || 0)} V`,
      icon: "🔋",
      color: cardColors.accentGreen,
    },
    // Current & Environmental Impact
    {
      label: "Total Current",
      value: `${roundValue(bmsState.TotalCurrent?.N || 0)} A`,
      icon: "⚡",
      color: cardColors.highlight,
    },
    {
      label: "Carbon Offset",
      value: `${roundValue(bmsState.Carbon_Offset_kg?.N || 0)} kg`,
      icon: "🌍",
      color: cardColors.accentGreen,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        margin: "-5px", // To compensate for card margins
        height: "100%",
        overflow: "auto",
      }}
    >
      {cardItems.map((item, index) => (
        <CardItem
          key={index}
          label={item.label}
          value={item.value}
          icon={item.icon}
          color={item.color}
        />
      ))}
    </div>
  );
};

export default Cards;
