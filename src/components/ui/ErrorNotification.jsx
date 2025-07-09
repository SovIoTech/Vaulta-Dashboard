// src/components/ui/ErrorNotification.jsx
import React from "react";
import { theme } from "../../styles/theme";

const ErrorNotification = ({
  error,
  onRetry,
  title = "Data Fetch Error",
  showRetry = true,
}) => {
  const containerStyle = {
    backgroundColor: "#ffebee",
    border: `1px solid ${theme.colors.danger}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.md,
  };

  const iconStyle = {
    fontSize: "24px",
    color: theme.colors.danger,
  };

  const contentStyle = {
    flex: 1,
  };

  const titleStyle = {
    color: theme.colors.danger,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: theme.spacing.sm,
  };

  const messageStyle = {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
    lineHeight: 1.4,
  };

  const retryButtonStyle = {
    backgroundColor: theme.colors.danger,
    color: theme.colors.surface,
    border: "none",
    borderRadius: theme.borderRadius.md,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>⚠️</div>
      <div style={contentStyle}>
        <div style={titleStyle}>{title}</div>
        <div style={messageStyle}>{error}</div>
      </div>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          style={retryButtonStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#d32f2f")}
          onMouseOut={(e) =>
            (e.target.style.backgroundColor = theme.colors.danger)
          }
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorNotification;
