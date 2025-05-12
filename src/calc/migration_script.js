import AWS from "aws-sdk";

// Configure AWS
const AWS_REGION = "ap-southeast-2"; // Using your region
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: "ap-southeast-2" });

// Constants
const SOURCE_TABLE = "CAN_BMS_Data";
const TARGET_TABLE = "CAN_BMS_Data_Optimized";
const BATCH_SIZE = 25; // DynamoDB batch write limit
const LATEST_MARKER = "LATEST"; // Constant for LatestDataIndex

// Function to create time bucket attributes from timestamp
function createTimeBuckets(unixTimestamp, batteryId) {
  try {
    // Convert Unix timestamp to JavaScript Date
    const date = new Date(unixTimestamp * 1000);

    // Format: YYYYMMDD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");

    // Create time bucket keys
    const hourBucket = `${batteryId}#HOUR_${year}${month}${day}${hour}`;
    const dayBucket = `${batteryId}#DAY_${year}${month}${day}`;
    const monthBucket = `${batteryId}#MONTH_${year}${month}`;

    return {
      TagID_TimeWindow_HOUR: hourBucket,
      TagID_TimeWindow_DAY: dayBucket,
      TagID_TimeWindow_MONTH: monthBucket,
    };
  } catch (error) {
    console.error(
      `Error creating time buckets for timestamp ${unixTimestamp}:`,
      error
    );
    // Return default values in case of error
    return {
      TagID_TimeWindow_HOUR: `${batteryId}#HOUR_ERROR`,
      TagID_TimeWindow_DAY: `${batteryId}#DAY_ERROR`,
      TagID_TimeWindow_MONTH: `${batteryId}#MONTH_ERROR`,
    };
  }
}

// Function to process items in batches
async function processBatch(items) {
  if (!items || items.length === 0) return 0;

  // Transform items for new schema
  const batchWriteParams = {
    RequestItems: {
      [TARGET_TABLE]: [],
    },
  };

  // Process each item in the batch
  for (const item of items) {
    try {
      // Skip items without required fields
      if (!item.TagID || !item.Timestamp) {
        console.warn(
          "Skipping item missing required fields:",
          JSON.stringify(item, null, 2)
        );
        continue;
      }

      // Create time bucket attributes
      const timeBuckets = createTimeBuckets(item.Timestamp, item.TagID);

      // Create the new item with all required attributes
      const newItem = {
        // Original keys
        TagID: item.TagID,
        Timestamp: item.Timestamp,

        // GSI keys
        LATEST: LATEST_MARKER,
        ...timeBuckets,

        // Copy all other attributes from the original item
        ...item,
      };

      // Add to batch write request
      batchWriteParams.RequestItems[TARGET_TABLE].push({
        PutRequest: { Item: newItem },
      });
    } catch (error) {
      console.error("Error transforming item:", error);
      console.error("Problematic item:", JSON.stringify(item, null, 2));
    }
  }

  // If nothing to write, return 0
  if (batchWriteParams.RequestItems[TARGET_TABLE].length === 0) {
    return 0;
  }

  // Write the batch to the new table
  try {
    await dynamoDB.batchWrite(batchWriteParams).promise();
    return batchWriteParams.RequestItems[TARGET_TABLE].length;
  } catch (error) {
    console.error("Error writing batch to target table:", error);
    console.error("Failed batch:", JSON.stringify(batchWriteParams, null, 2));
    throw error; // Re-throw to be handled by caller
  }
}

// Main migration function
async function migrateData() {
  console.log(`Starting migration from ${SOURCE_TABLE} to ${TARGET_TABLE}...`);

  let lastEvaluatedKey = null;
  let totalMigrated = 0;
  let scanCount = 0;

  do {
    try {
      // Scan the original table in batches
      scanCount++;
      console.log(
        `Scan #${scanCount} - Starting from key:`,
        lastEvaluatedKey || "Beginning"
      );

      const scanParams = {
        TableName: SOURCE_TABLE,
        Limit: BATCH_SIZE,
        ExclusiveStartKey: lastEvaluatedKey,
      };

      const scanResult = await dynamoDB.scan(scanParams).promise();
      lastEvaluatedKey = scanResult.LastEvaluatedKey;

      // Process this batch
      if (scanResult.Items && scanResult.Items.length > 0) {
        console.log(`Found ${scanResult.Items.length} items to process`);

        // Process in chunks of BATCH_SIZE
        for (let i = 0; i < scanResult.Items.length; i += BATCH_SIZE) {
          const chunk = scanResult.Items.slice(i, i + BATCH_SIZE);
          const processed = await processBatch(chunk);
          totalMigrated += processed;
          console.log(`Progress: Migrated ${totalMigrated} items so far`);
        }
      } else {
        console.log("No items found in this scan");
      }

      // Add a short delay to avoid throttling
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error during migration scan:", error);
      // Wait a bit longer when hitting errors
      console.log("Pausing for 2 seconds before retrying...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } while (lastEvaluatedKey);

  console.log(`Migration complete! Total items migrated: ${totalMigrated}`);
}

// Execute the migration
migrateData()
  .then(() => console.log("Migration script completed successfully"))
  .catch((err) => console.error("Migration failed with error:", err));
