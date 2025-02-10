import express from "express";
import AWS from "aws-sdk";
import fs from "fs";

const app = express();
const PORT = 3000;

// Initialize DynamoDB Client
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: "ap-southeast-2" });

const TABLE_NAME = "CAN_BMS_Data";

// Middleware to check authentication (placeholder)
function authenticate(req, res, next) {
  // Replace with real authentication logic
  const isAuthenticated = true; // Change to actual auth check
  if (isAuthenticated) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Function to get the latest saved data from DynamoDB
async function getLatestNodeData() {
  const params = {
    TableName: TABLE_NAME,
    ScanIndexForward: false, // Descending order (latest first)
    Limit: 1, // Only fetch the most recent entry
    KeyConditionExpression: "#tagID = :tagVal",
    ExpressionAttributeNames: {
      "#tagID": "TagID",
    },
    ExpressionAttributeValues: {
      ":tagVal": "your-tag-id-here", // Replace with the actual TagID
    },
  };

  try {
    const data = await dynamoDB.query(params).promise();
    return data.Items.length > 0 ? data.Items[0] : null;
  } catch (error) {
    console.error("Error querying latest node data:", error);
    throw error;
  }
}

// Function to structure the latest data and save it
function structureAndSaveData(item) {
  if (!item) {
    console.log("No data found.");
    return;
  }

  const structuredData = {
    Timestamp: item.Timestamp,
    Node00: {
      SerialNumber: item.Node00SerialNumber,
      HardwareId: item.Node00HardwareId,
      SeriesPosition: item.Node00SeriesPosition,
      ParallelPosition: item.Node00ParallelPosition,
      CellCount: item.Node00CellCount,
      TempCount: item.Node00TempCount,
      BmsState: item.Node00BmsState,
      BmsCounter: item.Node00BmsCounter,
      Cells: [
        item.Node00Cell00,
        item.Node00Cell01,
        item.Node00Cell02,
        item.Node00Cell03,
        item.Node00Cell04,
        item.Node00Cell05,
        item.Node00Cell06,
        item.Node00Cell07,
        item.Node00Cell08,
        item.Node00Cell09,
        item.Node00Cell10,
        item.Node00Cell11,
        item.Node00Cell12,
        item.Node00Cell13,
      ],
      Temps: [
        item.Node00Temp00,
        item.Node00Temp01,
        item.Node00Temp02,
        item.Node00Temp03,
        item.Node00Temp04,
        item.Node00Temp05,
      ],
      BalanceThreshold: item.Node00BalanceThreshold,
      BalanceStatus: item.Node00BalanceStatus,
      TotalVoltage: item.Node00TotalVoltage,
    },
    Node01: {
      SerialNumber: item.Node01SerialNumber,
      HardwareId: item.Node01HardwareId,
      SeriesPosition: item.Node01SeriesPosition,
      ParallelPosition: item.Node01ParallelPosition,
      CellCount: item.Node01CellCount,
      TempCount: item.Node01TempCount,
      BmsState: item.Node01BmsState,
      BmsCounter: item.Node01BmsCounter,
      Cells: [
        item.Node01Cell00,
        item.Node01Cell01,
        item.Node01Cell02,
        item.Node01Cell03,
        item.Node01Cell04,
        item.Node01Cell05,
        item.Node01Cell06,
        item.Node01Cell07,
        item.Node01Cell08,
        item.Node01Cell09,
        item.Node01Cell10,
        item.Node01Cell11,
        item.Node01Cell12,
        item.Node01Cell13,
      ],
      Temps: [
        item.Node01Temp00,
        item.Node01Temp01,
        item.Node01Temp02,
        item.Node01Temp03,
        item.Node01Temp04,
        item.Node01Temp05,
      ],
      BalanceThreshold: item.Node01BalanceThreshold,
      BalanceStatus: item.Node01BalanceStatus,
      TotalVoltage: item.Node01TotalVoltage,
    },
  };

  // Save structured data to a file
  const fileName = "nodeValuesStructured.json";
  fs.writeFileSync(fileName, JSON.stringify(structuredData, null, 2), "utf-8");
  console.log(`Structured data saved to ${fileName}`);
}

// API route to fetch and process the latest node data (after authentication)
app.get("/latest-node-data", authenticate, async (req, res) => {
  try {
    const latestData = await getLatestNodeData();
    structureAndSaveData(latestData);
    res.json({ message: "Latest data fetched and saved.", data: latestData });
  } catch (error) {
    res.status(500).json({ error: "Error fetching latest data." });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
