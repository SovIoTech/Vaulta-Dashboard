// components/Cards.js
"use client";
import React from "react";

const Cards = ({ bmsState, roundValue }) => {
  const cardData = [
    {
      title: "SOC",
      values: [
        { label: "Ah", value: roundValue(bmsState.SOCAh?.N || 0) },
        { label: "%", value: roundValue(bmsState.SOCPercent?.N || 0) },
      ],
    },
    {
      title: "Balance SOC",
      values: [
        { label: "Ah", value: roundValue(bmsState.BalanceSOCAh?.N || 0) },
        { label: "%", value: roundValue(bmsState.BalanceSOCPercent?.N || 0) },
      ],
    },
    {
      title: "Voltages",
      values: [
        { label: "Load", value: roundValue(bmsState.TotalLoadVoltage?.N || 0) },
        {
          label: "Battery",
          value: roundValue(bmsState.TotalBattVoltage?.N || 0),
        },
      ],
    },
    {
      title: "Total Current",
      values: [
        { label: "Current", value: roundValue(bmsState.TotalCurrent?.N || 0) },
      ],
    },
    {
      title: "Pack Info",
      values: [
        {
          label: "Node Count",
          value: roundValue(bmsState.PackNodeCount?.N || 0),
        },
        {
          label: "Num Nodes",
          value: roundValue(bmsState.PackNumNodes?.N || 0),
        },
        {
          label: "Parallel Nodes",
          value: roundValue(bmsState.PackNumParallelNodes?.N || 0),
        },
      ],
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "20px",
      }}
    >
      {cardData.map((card, index) => (
        <div
          key={index}
          style={{
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>
            {card.title}
          </h3>
          {card.values.map((item, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ddd",
                borderRadius: "20px",
                padding: "10px",
                margin: "10px 0",
              }}
            >
              <strong>{item.label}:</strong> {item.value}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Cards;
