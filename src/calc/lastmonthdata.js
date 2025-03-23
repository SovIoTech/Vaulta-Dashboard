import AWS from "aws-sdk";
import { fetchAuthSession } from "aws-amplify/auth";
import awsconfig from "../aws-exports.js";

export const getLastMonthData = async (selectedTagId, onBatchFetch) => {
  console.log("Starting data fetch for TagID:", selectedTagId);
  try {
    const session = await fetchAuthSession();
    const credentials = session.credentials;

    const dynamoDB = new AWS.DynamoDB({
      apiVersion: "2012-10-17",
      region: awsconfig.aws_project_region,
      credentials,
    });

    const now = Math.floor(Date.now() / 1000);
    const lastMonth = now - 30 * 24 * 60 * 60;

    const params = {
      TableName: "CAN_BMS_Data",
      KeyConditionExpression:
        "#tagID = :tagID and #ts BETWEEN :lastMonth AND :now",
      ExpressionAttributeNames: {
        "#tagID": "TagID",
        "#ts": "Timestamp",
      },
      ExpressionAttributeValues: {
        ":tagID": { S: `BAT-${selectedTagId}` },
        ":lastMonth": { N: lastMonth.toString() },
        ":now": { N: now.toString() },
      },
      ProjectionExpression:
        "#ts, TotalBattVoltage, TotalLoadVoltage, TotalCurrent",
      ScanIndexForward: true,
    };

    let allItems = [];
    let lastEvaluatedKey = null;

    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const data = await dynamoDB.query(params).promise();
      console.log(`Fetched ${data.Items.length} items in this batch`);

      allItems = allItems.concat(data.Items);

      if (onBatchFetch) {
        onBatchFetch(data.Items.length, allItems.length);
      }

      lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    console.log("Fetching completed. Total items fetched:", allItems.length);

    // Process and group items by hour
    const groupedByHour = {};

    allItems.forEach((item) => {
      try {
        const parsedItem = {
          TotalBattVoltage: parseFloat(item.TotalBattVoltage?.N || "0"),
          TotalLoadVoltage: parseFloat(item.TotalLoadVoltage?.N || "0"),
          TotalCurrent: parseFloat(item.TotalCurrent?.N || "0"),
          Timestamp: parseInt(item.Timestamp?.N || "0"),
        };

        const date = new Date(parsedItem.Timestamp * 1000);
        const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
        const hourKey = `${dayKey}T${String(date.getHours()).padStart(
          2,
          "0"
        )}:00`; // YYYY-MM-DDTHH:00

        // Initialize the hour's array if it doesn't exist
        if (!groupedByHour[hourKey]) {
          groupedByHour[hourKey] = {
            TotalBattVoltage: 0,
            TotalLoadVoltage: 0,
            TotalCurrent: 0,
            Count: 0,
          };
        }

        // Sum up the values for the hour
        groupedByHour[hourKey].TotalBattVoltage += parsedItem.TotalBattVoltage;
        groupedByHour[hourKey].TotalLoadVoltage += parsedItem.TotalLoadVoltage;
        groupedByHour[hourKey].TotalCurrent += parsedItem.TotalCurrent;
        groupedByHour[hourKey].Count += 1;
      } catch (parseError) {
        console.error("Error parsing item:", item, parseError);
      }
    });

    // Calculate averages for each hour
    const hourlyAverages = {};
    for (const [hourKey, values] of Object.entries(groupedByHour)) {
      hourlyAverages[hourKey] = {
        TotalBattVoltage: values.TotalBattVoltage / values.Count,
        TotalLoadVoltage: values.TotalLoadVoltage / values.Count,
        TotalCurrent: values.TotalCurrent / values.Count,
      };
    }

    console.log("Hourly averages calculated:", hourlyAverages);

    // Calculate power for each hour
    const hourlyPower = {};
    const chargingHours = []; // Array to store charging hours

    for (const [hourKey, values] of Object.entries(hourlyAverages)) {
      const power = values.TotalLoadVoltage * values.TotalCurrent;
      hourlyPower[hourKey] = {
        ...values,
        Power: power,
      };

      // Check if power is negative (charging)
      if (power < 0) {
        chargingHours.push({ hour: hourKey, status: "Recharging" });
      }
    }

    console.log("Hourly power calculated:", hourlyPower);
    console.log("Charging hours:", chargingHours);

    // Sum positive power values for each day and count positive usage hours
    const dailyPowerSummary = {};
    for (const [hourKey, values] of Object.entries(hourlyPower)) {
      const dayKey = hourKey.split("T")[0]; // Extract YYYY-MM-DD from hourKey

      if (!dailyPowerSummary[dayKey]) {
        dailyPowerSummary[dayKey] = {
          TotalPower: 0,
          PositiveHours: 0,
        };
      }

      if (values.Power > 0) {
        dailyPowerSummary[dayKey].TotalPower += values.Power;
        dailyPowerSummary[dayKey].PositiveHours += 1;
      }
    }

    // Calculate average power for each day
    for (const [dayKey, summary] of Object.entries(dailyPowerSummary)) {
      if (summary.PositiveHours > 0) {
        summary.AveragePower = summary.TotalPower / summary.PositiveHours;
      } else {
        summary.AveragePower = "N.A"; // No usage
      }
    }

    console.log("Daily power summary:", dailyPowerSummary);

    // Find the most power-consumed day in each week
    const weeklyPeakUsage = {};
    for (const [dayKey, summary] of Object.entries(dailyPowerSummary)) {
      const date = new Date(dayKey);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
        .toISOString()
        .split("T")[0]; // Start of the week (Sunday)

      if (!weeklyPeakUsage[weekStart]) {
        weeklyPeakUsage[weekStart] = {
          PeakDay: dayKey,
          PeakPower: summary.AveragePower,
        };
      } else if (
        summary.AveragePower !== "N.A" &&
        (weeklyPeakUsage[weekStart].PeakPower === "N.A" ||
          summary.AveragePower > weeklyPeakUsage[weekStart].PeakPower)
      ) {
        weeklyPeakUsage[weekStart] = {
          PeakDay: dayKey,
          PeakPower: summary.AveragePower,
        };
      }
    }

    console.log("Weekly peak usage:", weeklyPeakUsage);

    return {
      hourlyAverages,
      hourlyPower,
      dailyPowerSummary,
      weeklyPeakUsage,
      chargingHours, // Include charging hours in the output
    };
  } catch (error) {
    console.error("Fatal error in getLastMonthData:", {
      error: error.message,
      stack: error.stack,
      selectedTagId,
    });
    throw error;
  }
};
