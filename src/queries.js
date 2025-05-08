// Function to fetch the last data point (latest entry based on Timestamp)
export const getLastMinuteData = async (dynamoDB, tableName, tagID) => {
  const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
  const lastMinute = now - 60; // 60 seconds ago

  const params = {
    TableName: tableName,
    KeyConditionExpression: "#tagID = :tagID and #timestamp >= :lastMinute",
    ExpressionAttributeNames: {
      "#tagID": "TagID", // Alias for the 'TagID' key
      "#timestamp": "Timestamp", // Alias for the reserved 'Timestamp' keyword
    },
    ExpressionAttributeValues: {
      ":tagID": { S: tagID },
      ":lastMinute": { N: lastMinute.toString() },
    },
    ScanIndexForward: false, // Sort descending by Timestamp (latest first)
    Limit: 1, // Only fetch the latest entry
  };

  try {
    const data = await dynamoDB.query(params).promise();
    return data.Items;
  } catch (error) {
    console.error("Error fetching last minute data:", error);
    throw error;
  }
};

// Function to fetch the most recently inserted record (latest entry based on Timestamp)
export const getLastInsertedData = async (dynamoDB, tableName, tagID) => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "#tagID = :tagID",
    ExpressionAttributeNames: {
      "#tagID": "TagID", // Alias for the 'TagID' key
    },
    ExpressionAttributeValues: {
      ":tagID": { S: tagID },
    },
    ScanIndexForward: false, // Sort descending by Timestamp (latest first)
    Limit: 1, // Only fetch the latest entry
  };

  try {
    const data = await dynamoDB.query(params).promise();
    return data.Items;
  } catch (error) {
    console.error("Error fetching last inserted data:", error);
    throw error;
  }
};

// Function to fetch data by TagID and Timestamp range
export const getDataByTagAndTimestamp = async (
  dynamoDB,
  tableName,
  tagID,
  startTime,
  endTime
) => {
  const params = {
    TableName: tableName,
    KeyConditionExpression:
      "#tagID = :tagID and #timestamp BETWEEN :startTime AND :endTime",
    ExpressionAttributeNames: {
      "#tagID": "TagID", // Alias for the 'TagID' key
      "#timestamp": "Timestamp", // Alias for the reserved 'Timestamp' keyword
    },
    ExpressionAttributeValues: {
      ":tagID": { S: tagID },
      ":startTime": { N: startTime.toString() },
      ":endTime": { N: endTime.toString() },
    },
    ScanIndexForward: true, // Sort ascending by Timestamp
  };

  try {
    const data = await dynamoDB.query(params).promise();
    return data.Items;
  } catch (error) {
    console.error("Error fetching data by TagID and Timestamp range:", error);
    throw error;
  }
};

// Function to fetch data by specific Timestamp
export const getDataByTimestamp = async (
  dynamoDB,
  tableName,
  tagID,
  timestamp
) => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "#tagID = :tagID and #timestamp = :timestamp", // Add TagID to the key condition
    ExpressionAttributeNames: {
      "#tagID": "TagID", // Alias for 'TagID'
      "#timestamp": "Timestamp", // Alias for 'Timestamp'
    },
    ExpressionAttributeValues: {
      ":tagID": { S: tagID }, // Pass TagID value
      ":timestamp": { N: timestamp.toString() }, // Pass Timestamp value
    },
  };

  try {
    const data = await dynamoDB.query(params).promise();
    return data.Items;
  } catch (error) {
    console.error("Error fetching data by Timestamp:", error);
    throw error;
  }
};

export const getLastMonthData = async (dynamoDB, tableName, tagID) => {
  const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
  const lastMonth = now - 30 * 24 * 60 * 60; // 30 days ago in Unix timestamp

  const params = {
    TableName: tableName,
    KeyConditionExpression:
      "#tagID = :tagID and #timestamp BETWEEN :lastMonth AND :now",
    ExpressionAttributeNames: {
      "#tagID": "TagID", // Alias for the 'TagID' key
      "#timestamp": "Timestamp", // Alias for the reserved 'Timestamp' keyword
    },
    ExpressionAttributeValues: {
      ":tagID": { S: tagID },
      ":lastMonth": { N: lastMonth.toString() }, // Start of the last month
      ":now": { N: now.toString() }, // Current time
    },
    ProjectionExpression:
      "totalBattVoltage, totalLoadVoltage, totalCurrent, Timestamp", // Fetch only these attributes
    ScanIndexForward: true, // Sort ascending by Timestamp
  };

  let allItems = [];
  let lastEvaluatedKey = null;

  do {
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }

    const data = await dynamoDB.query(params).promise();
    allItems = allItems.concat(data.Items);
    lastEvaluatedKey = data.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return allItems;
};
