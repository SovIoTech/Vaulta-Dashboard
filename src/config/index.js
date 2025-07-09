// src/config/index.js
import awsmobile from "./aws-exports.js";

// Consolidate all configuration
export const config = {
  // AWS Configuration
  aws: {
    region: awsmobile.aws_project_region,
    cognito: {
      userPoolId: awsmobile.aws_user_pools_id,
      userPoolClientId: awsmobile.aws_user_pools_web_client_id,
      identityPoolId: awsmobile.aws_cognito_identity_pool_id,
      region: awsmobile.aws_cognito_region,
    },
  },

  // API Configuration
  api: {
    dynamodb: {
      tableName: "CAN_BMS_Data",
      region: awsmobile.aws_project_region,
    },
    lambda: {
      functions: {
        consumptionTrends:
          "arn:aws:lambda:ap-southeast-2:183631334799:function:consumption_trends",
      },
    },
  },

  // App Configuration
  app: {
    name: "Battery Management System",
    version: "2.5.1",
    refreshInterval: 20000, // 20 seconds
    defaultTagId: "BAT-0x440",
  },

  // Available TagIDs
  tagIds: [
    "0x100",
    "0x140",
    "0x180",
    "0x1C0",
    "0x200",
    "0x240",
    "0x280",
    "0x2C0",
    "0x400",
    "0x440",
    "0x480",
    "0x4C0",
    "0x500",
    "0x540",
    "0x580",
    "0x5C0",
    "0x600",
    "0x640",
    "0x680",
    "0x6C0",
    "0x740",
    "0x780",
  ],
};

export default config;
