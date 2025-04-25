import React from "react";
import PropTypes from "prop-types";
import NodeTables from "./NodeTables.js";

const DashboardCells = ({ bmsState, nodeData, roundValue }) => {
  return (
    <div style={{ 
      flex: 1, 
      backgroundColor: "#fff",
      borderRadius: "2px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 160px)" // Adjust based on other elements
    }}>
      <div style={{ padding: "10px 15px", borderBottom: "1px solid #e0e0e0" }}>
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: "600", color: "#333333" }}>
          Cell & Temperature Data
        </h2>
      </div>
      
      <div style={{ flex: 1, overflow: "hidden", padding: "10px" }}>
        <NodeTables nodeData={nodeData} condensed={true} />
      </div>
      
      {/* Footer Stats Bar */}
      <div style={{ 
        backgroundColor: "#f5f5f5", 
        borderTop: "1px solid #e0e0e0",
        padding: "8px 15px",
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.75rem",
        color: "#666"
      }}>
        <div>Max Cell Voltage: {roundValue(bmsState.MaximumCellVoltage?.N || 0)} V</div>
        <div>Min Cell Voltage: {roundValue(bmsState.MinimumCellVoltage?.N || 0)} V</div>
        <div>Delta: {(parseFloat(bmsState.MaximumCellVoltage?.N || 0) - parseFloat(bmsState.MinimumCellVoltage?.N || 0)).toFixed(3)} V</div>
        <div>Total Cells: 28</div>
        <div>Balance Status: Active</div>
      </div>
    </div>
  );
};

DashboardCells.propTypes = {
  bmsState: PropTypes.object.isRequired,
  nodeData: PropTypes.array.isRequired,
  roundValue: PropTypes.func.isRequired
};

export default DashboardCells;