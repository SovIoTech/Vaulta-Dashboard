// components/TablesPage.js
"use client";
import React from "react";
import NodeTables from "./NodeTables.js";

const TablesPage = ({ nodeData }) => {
  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px" }}>
        Tables
      </h1>
      <NodeTables nodeData={nodeData} />
    </div>
  );
};

export default TablesPage;
