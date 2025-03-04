// components/Page2.js
"use client";
import React from "react";
import BatteryStats from "./BatteryStats.js";

const Page2 = ({ bmsState, roundValue }) => {
  return (
    <div>
      <BatteryStats bmsState={bmsState} roundValue={roundValue} />
    </div>
  );
};

export default Page2;
