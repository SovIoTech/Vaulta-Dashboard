// src/components/ui/LoadingSpinner.jsx
import React from "react";
import { theme } from "../../styles/theme";

const LoadingSpinner = ({
  size = "medium",
  message = "Loading...",
  fullScreen = false,
}) => {
  const sizes = {
    small: "20px",
    medium: "40px",
    large: "60px",
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    ...(fullScreen && {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      zIndex: 9999,
    }),
  };

  const spinnerStyle = {
    border: `4px solid ${theme.colors.border}`,
    borderTop: `4px solid ${theme.colors.primary}`,
    borderRadius: "50%",
    width: sizes[size],
    height: sizes[size],
    animation: "spin 1s linear infinite",
    marginBottom: theme.spacing.md,
  };

  const messageStyle = {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.medium,
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <p style={messageStyle}>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
