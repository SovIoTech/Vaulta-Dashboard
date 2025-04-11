import React from "react";

const CardItem = ({ label, value, icon, color }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      border: "1px solid #e6e6e6",
      borderRadius: "15px", // Rounded corners for OneUI
      padding: "15px",
      margin: "10px 0",
      backgroundColor: "#ffffff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}
  >
    {icon && (
      <div
        style={{
          marginRight: "15px",
          color: color || "#1259c3", // Default to OneUI blue
          fontSize: "24px",
        }}
      >
        {icon}
      </div>
    )}
    <div>
      <div style={{ color: "#757575", fontSize: "14px" }}>{label}</div>
      <div style={{ fontWeight: "bold", fontSize: "16px", color: "#000000" }}>
        {value}
      </div>
    </div>
  </div>
);

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
