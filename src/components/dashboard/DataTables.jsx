// src/components/dashboard/DataTables.jsx
import React from "react";
import PropTypes from "prop-types";

// Import existing components (will use until they're refactored)
import NodeTables from "../../app/components/NodeTables.js";

// Import new utilities
import { theme } from "../../styles/theme.js";
import { roundValue } from "../../utils/helpers.js";

const DataTables = ({ bmsData }) => {
  // Extract BMS state from data
  const bmsState = bmsData?.lastMinuteData?.[0] || {};

  // Process node data
  const nodeData = [
    {
      node: "Node 00",
      data: {
        balanceStatus: roundValue(bmsState?.Node00BalanceStatus?.N || "NaN"),
        totalVoltage: roundValue(bmsState?.Node00TotalVoltage?.N || "NaN"),
        cellVoltages: Array.from({ length: 14 }, (_, i) =>
          roundValue(
            bmsState?.[`Node00Cell${i < 10 ? `0${i}` : i}`]?.N || "NaN"
          )
        ),
        temperatures: Array.from({ length: 6 }, (_, i) =>
          roundValue(
            bmsState?.[`Node00Temp${i < 10 ? `0${i}` : i}`]?.N || "NaN"
          )
        ),
        tempCount: roundValue(bmsState?.Node00TempCount?.N || "NaN"),
      },
    },
    {
      node: "Node 01",
      data: {
        balanceStatus: roundValue(bmsState?.Node01BalanceStatus?.N || "NaN"),
        totalVoltage: roundValue(bmsState?.Node01TotalVoltage?.N || "NaN"),
        cellVoltages: Array.from({ length: 14 }, (_, i) =>
          roundValue(
            bmsState?.[`Node01Cell${i < 10 ? `0${i}` : i}`]?.N || "NaN"
          )
        ),
        temperatures: Array.from({ length: 6 }, (_, i) =>
          roundValue(
            bmsState?.[`Node01Temp${i < 10 ? `0${i}` : i}`]?.N || "NaN"
          )
        ),
        tempCount: roundValue(bmsState?.Node01TempCount?.N || "NaN"),
      },
    },
  ];

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        boxShadow: theme.shadows.card,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing.md,
          paddingBottom: theme.spacing.xs,
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <h2
          style={{
            color: theme.colors.textPrimary,
            margin: 0,
            fontWeight: theme.typography.fontWeights.semibold,
            fontSize: theme.typography.sizes.lg,
          }}
        >
          Cell & Temperature Data
        </h2>

        {/* Summary Stats */}
        <div
          style={{
            display: "flex",
            gap: theme.spacing.lg,
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.textSecondary,
          }}
        >
          <div>
            <strong>Max Cell:</strong>{" "}
            {roundValue(bmsState.MaximumCellVoltage?.N || 0)}V
          </div>
          <div>
            <strong>Min Cell:</strong>{" "}
            {roundValue(bmsState.MinimumCellVoltage?.N || 0)}V
          </div>
          <div>
            <strong>Delta:</strong>{" "}
            {(
              parseFloat(bmsState.MaximumCellVoltage?.N || 0) -
              parseFloat(bmsState.MinimumCellVoltage?.N || 0)
            ).toFixed(3)}
            V
          </div>
        </div>
      </div>

      {/* Node Tables */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <NodeTables nodeData={nodeData} colors={theme.colors} />
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: theme.spacing.sm,
          padding: theme.spacing.xs,
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.borderRadius.sm,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: theme.typography.sizes.sm,
          color: theme.colors.textSecondary,
        }}
      >
        <div>
          <strong>Total Cells:</strong> 28
        </div>
        <div>
          <strong>Balance Status:</strong>
          <span
            style={{
              marginLeft: theme.spacing.xs,
              color: theme.colors.success,
              fontWeight: theme.typography.fontWeights.semibold,
            }}
          >
            Active
          </span>
        </div>
        <div>
          <strong>Max Temp:</strong> {roundValue(bmsState.MaxCellTemp?.N || 0)}
          °C
        </div>
        <div>
          <strong>Min Temp:</strong> {roundValue(bmsState.MinCellTemp?.N || 0)}
          °C
        </div>
        <div>
          <strong>Last Updated:</strong> {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

DataTables.propTypes = {
  bmsData: PropTypes.shape({
    lastMinuteData: PropTypes.array,
  }),
};

DataTables.defaultProps = {
  bmsData: {
    lastMinuteData: [{}],
  },
};

export default DataTables;
