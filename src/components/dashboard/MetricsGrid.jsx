// src/components/dashboard/MetricsGrid.jsx
import React from "react";
import PropTypes from "prop-types";

// Import existing components (will use until they're refactored)
import Cards from "../../app/components/Cards.js";
import Gauges from "../../app/components/Gauges.js";

// Import new utilities
import { theme } from "../../styles/theme.js";
import { roundValue } from "../../utils/helpers.js";

const MetricsGrid = ({ bmsData }) => {
  // Extract BMS state from data
  const bmsState = bmsData?.lastMinuteData?.[0] || {};

  return (
    <>
      {/* Battery Status Section */}
      <div
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          boxShadow: theme.shadows.card,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <h2
          style={{
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.md,
            fontWeight: theme.typography.fontWeights.semibold,
            fontSize: theme.typography.sizes.lg,
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: theme.spacing.xs,
          }}
        >
          Battery Status
        </h2>

        <div style={{ flex: 1, minHeight: 0 }}>
          <Cards
            bmsState={bmsState}
            roundValue={roundValue}
            colors={theme.colors}
          />
        </div>
      </div>

      {/* Battery Performance Section */}
      <div
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          boxShadow: theme.shadows.card,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <h2
          style={{
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.md,
            fontWeight: theme.typography.fontWeights.semibold,
            fontSize: theme.typography.sizes.lg,
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: theme.spacing.xs,
          }}
        >
          Battery Performance
        </h2>

        <div style={{ flex: 1, minHeight: 0 }}>
          <Gauges
            bmsState={bmsState}
            roundValue={roundValue}
            colors={theme.colors}
          />
        </div>
      </div>
    </>
  );
};

MetricsGrid.propTypes = {
  bmsData: PropTypes.shape({
    lastMinuteData: PropTypes.array,
  }),
};

MetricsGrid.defaultProps = {
  bmsData: {
    lastMinuteData: [{}],
  },
};

export default MetricsGrid;
