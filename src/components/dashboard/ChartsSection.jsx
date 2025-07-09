// src/components/dashboard/ChartsSection.jsx
import React from "react";
import PropTypes from "prop-types";

// Import existing components (will use until they're refactored)
import WeatherCard from "../../app/components/WeatherCard.js";
import BatteryMetricsCarousel from "../../app/components/BatteryMetricsCarousel.js";

// Import new utilities
import { theme } from "../../styles/theme.js";
import { roundValue } from "../../utils/helpers.js";

const ChartsSection = ({ bmsData }) => {
  // Extract BMS state from data
  const bmsState = bmsData?.lastMinuteData?.[0] || {};

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: theme.spacing.sm,
      }}
    >
      {/* Top Row - Weather and System Metrics */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: theme.spacing.sm,
          minHeight: 0,
        }}
      >
        {/* Weather Card */}
        <div
          style={{
            flex: 0.35,
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <WeatherCard city="Brisbane" containerRef={null} />
        </div>

        {/* System Metrics */}
        <div
          style={{
            flex: 0.65,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            boxShadow: theme.shadows.card,
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
            System Metrics
          </h2>

          <div style={{ flex: 1, minHeight: 0 }}>
            <BatteryMetricsCarousel
              bmsState={bmsState}
              roundValue={roundValue}
              containerRef={null}
              colors={theme.colors}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row - Additional Charts (placeholder for future expansion) */}
      <div
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          boxShadow: theme.shadows.card,
          height: "150px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: theme.colors.textSecondary,
          }}
        >
          <h3
            style={{
              margin: 0,
              marginBottom: theme.spacing.xs,
              fontSize: theme.typography.sizes.md,
            }}
          >
            Additional Charts
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: theme.typography.sizes.sm,
            }}
          >
            Future expansion area for trends, predictions, and analytics
          </p>
        </div>
      </div>
    </div>
  );
};

ChartsSection.propTypes = {
  bmsData: PropTypes.shape({
    lastMinuteData: PropTypes.array,
  }),
};

ChartsSection.defaultProps = {
  bmsData: {
    lastMinuteData: [{}],
  },
};

export default ChartsSection;
