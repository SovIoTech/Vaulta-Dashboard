// components/BatteryStats.js
"use client";
import React from "react";
import Cards from "./Cards.js";
import Gauges from "./Gauges.js";

const BatteryStats = ({ bmsState, roundValue }) => {
  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px" }}>
        Battery Stats
      </h1>
      <Cards bmsState={bmsState} roundValue={roundValue} />
      <Gauges bmsState={bmsState} roundValue={roundValue} />
    </div>
  );
};

export default BatteryStats;
