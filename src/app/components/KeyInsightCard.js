// KeyInsightsCard.js
import React from "react";
import CardItem from "./CardItem.js";

const KeyInsightsCard = ({ data, carbonOffset, sohEstimate }) => {
  const dailyPowerSummary = Object.values(data.dailyPowerSummary)[0];
  const hourlyPower = Object.values(data.hourlyPower);
  const chargingHours = data.chargingHours;

  const peakPowerConsumption = Math.max(
    ...hourlyPower.map((hour) => hour.Power)
  );
  const peakChargingPower = Math.min(...hourlyPower.map((hour) => hour.Power));
  const currentPowerStatus =
    hourlyPower[hourlyPower.length - 1].Power > 0 ? "Consuming" : "Charging";
  const avgBatteryVoltage =
    hourlyPower.reduce((sum, hour) => sum + hour.TotalBattVoltage, 0) /
    hourlyPower.length;
  const avgLoadVoltage =
    hourlyPower.reduce((sum, hour) => sum + hour.TotalLoadVoltage, 0) /
    hourlyPower.length;
  const totalChargingHours = chargingHours.length;
  const lastChargingEvent =
    chargingHours[chargingHours.length - 1]?.hour || "N/A";

  const cardSections = [
    {
      title: "Daily Power Summary",
      items: [
        {
          label: "Total Power Consumed",
          value: `${dailyPowerSummary.TotalPower.toFixed(2)} Wh`,
          icon: "⚡",
          color: "#2196F3",
        },
        {
          label: "Average Power Consumption",
          value: `${dailyPowerSummary.AveragePower.toFixed(2)} W`,
          icon: "📊",
          color: "#4CAF50",
        },
        {
          label: "Positive Hours",
          value: `${dailyPowerSummary.PositiveHours} hrs`,
          icon: "⏱️",
          color: "#FF9800",
        },
      ],
    },
    {
      title: "Hourly Power Insights",
      items: [
        {
          label: "Peak Power Consumption",
          value: `${peakPowerConsumption.toFixed(2)} W`,
          icon: "📈",
          color: "#F44336",
        },
        {
          label: "Peak Charging Power",
          value: `${peakChargingPower.toFixed(2)} W`,
          icon: "🔋",
          color: "#9C27B0",
        },
        {
          label: "Current Power Status",
          value: currentPowerStatus,
          icon: currentPowerStatus === "Consuming" ? "🔌" : "🔋",
          color: currentPowerStatus === "Consuming" ? "#FF9800" : "#4CAF50",
        },
      ],
    },
    {
      title: "Battery & Load Voltage",
      items: [
        {
          label: "Avg Battery Voltage",
          value: `${avgBatteryVoltage.toFixed(2)} V`,
          icon: "🔋",
          color: "#2196F3",
        },
        {
          label: "Avg Load Voltage",
          value: `${avgLoadVoltage.toFixed(2)} V`,
          icon: "🔌",
          color: "#4CAF50",
        },
      ],
    },
    {
      title: "Charging Insights",
      items: [
        {
          label: "Total Charging Hours",
          value: `${totalChargingHours} hrs`,
          icon: "⏳",
          color: "#9C27B0",
        },
        {
          label: "Last Charging Event",
          value: lastChargingEvent,
          icon: "🔋",
          color: "#FF9800",
        },
      ],
    },
    {
      title: "System Health",
      items: [
        {
          label: "State of Health (SOH)",
          value: `${sohEstimate?.toFixed(2) || "N/A"}%`,
          icon: "📉",
          color: "#F44336",
        },
        {
          label: "Carbon Offset",
          value: `${carbonOffset?.toFixed(2) || "N/A"} kg`,
          icon: "🌍",
          color: "#4CAF50",
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

export default KeyInsightsCard;
