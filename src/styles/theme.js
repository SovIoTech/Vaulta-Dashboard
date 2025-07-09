// src/styles/theme.js
export const theme = {
  colors: {
    // Primary colors (from your current OneUI theme)
    primary: "#1259c3",
    secondary: "#818181",
    success: "#4CAF50",
    danger: "#F44336",
    warning: "#FFC107",
    info: "#2196F3",

    // Background colors
    background: "#f2f2f2",
    surface: "#ffffff",
    card: "#ffffff",

    // Text colors
    textPrimary: "#333333",
    textSecondary: "#666666",
    textLight: "#999999",
    textDisabled: "#cccccc",

    // Border colors
    border: "#e6e6e6",
    borderLight: "#f0f0f0",

    // Status colors
    online: "#4CAF50",
    offline: "#F44336",
    loading: "#FFC107",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },

  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    pill: "25px",
  },

  shadows: {
    sm: "0 1px 3px rgba(0,0,0,0.1)",
    md: "0 2px 8px rgba(0,0,0,0.1)",
    lg: "0 4px 12px rgba(0,0,0,0.1)",
    xl: "0 8px 24px rgba(0,0,0,0.1)",
  },

  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    xxl: "1.5rem",
  },

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// Helper function to get theme values
export const getThemeValue = (path) => {
  return path.split(".").reduce((obj, key) => obj?.[key], theme);
};

// Common style combinations
export const commonStyles = {
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    border: `1px solid ${theme.colors.border}`,
  },

  button: {
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.surface,
      borderRadius: theme.borderRadius.pill,
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      border: "none",
      fontWeight: theme.fontWeights.medium,
    },

    secondary: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
      borderRadius: theme.borderRadius.pill,
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      border: `1px solid ${theme.colors.border}`,
      fontWeight: theme.fontWeights.medium,
    },
  },
};

export default theme;
