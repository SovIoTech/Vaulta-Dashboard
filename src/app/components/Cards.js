import React from "react";

const CardItem = ({ label, value, icon, color }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "15px",
      margin: "10px 0",
      backgroundColor: "#f9f9f9",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    }}
  >
    {icon && (
      <div
        style={{
          marginRight: "15px",
          color: color || "#333",
          fontSize: "24px",
        }}
      >
        {icon}
      </div>
    )}
    <div>
      <div style={{ color: "#666", fontSize: "14px" }}>{label}</div>
      <div style={{ fontWeight: "bold", fontSize: "16px" }}>{value}</div>
    </div>
  </div>
);

const Cards = ({ bmsState, roundValue }) => {
  const cardSections = [
    {
      title: "State of Charge (SOC)",
      items: [
        {
          label: "Ah Capacity",
          value: roundValue(bmsState.SOCAh?.N || 0),
          icon: "⚡",
        },
        {
          label: "Percentage",
          value: `${roundValue(bmsState.SOCPercent?.N || 0)}%`,
          icon: "%",
        },
      ],
    },
    {
      title: "Voltages",
      items: [
        {
          label: "Load Voltage",
          value: `${roundValue(bmsState.TotalLoadVoltage?.N || 0)} V`,
          icon: "🔌",
          color: "#2196F3",
        },
        {
          label: "Battery Voltage",
          value: `${roundValue(bmsState.TotalBattVoltage?.N || 0)} V`,
          icon: "🔋",
          color: "#4CAF50",
        },
      ],
    },
    {
      title: "Current & Pack Info",
      items: [
        {
          label: "Total Current",
          value: `${roundValue(bmsState.TotalCurrent?.N || 0)} A`,
          icon: "⚡",
          color: "#FF9800",
        },
        {
          label: "Node Count",
          value: roundValue(bmsState.PackNodeCount?.N || 0),
          icon: "#️⃣",
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
            borderRadius: "10px",
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            textAlign: "left",
          }}
        >
          <h3
            style={{
              fontWeight: "bold",
              marginBottom: "15px",
              color: "#333",
              borderBottom: "2px solid #f0f0f0",
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
