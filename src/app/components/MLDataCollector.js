import AWS from "aws-sdk";
import { fetchAuthSession } from "aws-amplify/auth";
import awsconfig from "../../aws-exports.js";

// Calculate time range based on selection
const calculateTimeRange = (timeRange) => {
  const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  switch (timeRange) {
    case "1month":
      return { startTime: now - 2592000, endTime: now }; // 30 days
    case "3months":
      return { startTime: now - 7776000, endTime: now }; // 90 days
    case "6months":
      return { startTime: now - 15552000, endTime: now }; // 180 days
    case "1year":
      return { startTime: now - 31536000, endTime: now }; // 365 days
    default:
      return { startTime: now - 2592000, endTime: now }; // Default to 30 days
  }
};

// Create time chunks for parallel processing
const createTimeChunks = (startTime, endTime, numChunks = 4) => {
  const timePerChunk = Math.floor((endTime - startTime) / numChunks);
  const chunks = [];
  
  for (let i = 0; i < numChunks; i++) {
    const chunkStart = startTime + (i * timePerChunk);
    // For the last chunk, use endTime to avoid rounding issues
    const chunkEnd = i === numChunks - 1 ? endTime : startTime + ((i + 1) * timePerChunk - 1);
    chunks.push({ 
      startTime: chunkStart, 
      endTime: chunkEnd,
      index: i,
      total: numChunks
    });
  }
  
  return chunks;
};

// Paginated query function to fetch data from a time chunk
const fetchChunkData = async (dynamoDB, tableName, tagID, chunk, progressCallback) => {
  let allItems = [];
  let lastEvaluatedKey = null;
  let pageCount = 0;
  let totalItems = 0;
  
  try {
    console.log(`Starting chunk ${chunk.index + 1}/${chunk.total}: ${new Date(chunk.startTime * 1000).toISOString()} to ${new Date(chunk.endTime * 1000).toISOString()}`);
    
    do {
      // Create the base query params
      const params = {
        TableName: tableName,
        KeyConditionExpression: "TagID = :tagID AND #ts BETWEEN :startTime AND :endTime",
        ExpressionAttributeNames: {
          "#ts": "Timestamp" // Use alias for reserved keyword
        },
        ExpressionAttributeValues: {
          ":tagID": { S: tagID },
          ":startTime": { N: chunk.startTime.toString() },
          ":endTime": { N: chunk.endTime.toString() }
        },
        Limit: 100 // Fetch 100 items per request
      };
      
      // Add the exclusiveStartKey for pagination if we have one
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }
      
      // Fetch the data
      const data = await dynamoDB.query(params).promise();
      
      // Add the items to our collection
      allItems = allItems.concat(data.Items);
      
      // Update pagination token
      lastEvaluatedKey = data.LastEvaluatedKey;
      
      // Update counters
      pageCount++;
      totalItems += data.Items.length;
      
      // Log progress
      console.log(`Chunk ${chunk.index + 1}/${chunk.total}: Page ${pageCount}, Total items: ${totalItems}`);
      
      // Call the progress callback if provided
      if (progressCallback) {
        const hasMore = lastEvaluatedKey !== undefined;
        progressCallback({
          chunk: chunk,
          pageCount,
          itemCount: totalItems,
          hasMore,
          status: hasMore ? "in_progress" : "complete",
          message: `Chunk ${chunk.index + 1}/${chunk.total}: Fetched ${totalItems} records...`
        });
      }
      
      // Add a small delay to avoid throttling
      if (lastEvaluatedKey) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
    } while (lastEvaluatedKey);
    
    console.log(`Completed chunk ${chunk.index + 1}/${chunk.total}: ${totalItems} items in ${pageCount} pages`);
    return { 
      items: allItems, 
      count: totalItems, 
      chunk: chunk
    };
    
  } catch (error) {
    console.error(`Error in chunk ${chunk.index + 1}/${chunk.total}:`, error);
    
    // Call the callback with error status
    if (progressCallback) {
      progressCallback({
        chunk: chunk,
        pageCount,
        itemCount: totalItems,
        hasMore: false,
        status: "error",
        error: error.message,
        message: `Error in chunk ${chunk.index + 1}/${chunk.total}: ${error.message}`
      });
    }
    
    throw error;
  }
};

// Stream processing function that processes data as it comes in
const streamProcessData = (taskType, chunks, progressCallback) => {
  // Initialize accumulators for the specific task type
  let processedData = null;
  let processedCount = 0;
  const totalCount = chunks.reduce((sum, chunk) => sum + chunk.count, 0);
  
  console.log(`Starting stream processing for ${taskType} with ${totalCount} total records`);
  
  // Combine all items and sort by timestamp
  const allItems = chunks.reduce((all, chunk) => all.concat(chunk.items), [])
    .sort((a, b) => parseInt(a.Timestamp.N) - parseInt(b.Timestamp.N));
  
  // Process data in batches to avoid blocking the UI
  const batchSize = 1000;
  const totalBatches = Math.ceil(allItems.length / batchSize);
  
  // For storage of a raw data sample
  const rawSample = allItems.slice(0, 5);
  
  return new Promise((resolve, reject) => {
    let batchIndex = 0;
    
    function processBatch() {
      const start = batchIndex * batchSize;
      const end = Math.min((batchIndex + 1) * batchSize, allItems.length);
      const batch = allItems.slice(start, end);
      
      try {
        // Process this batch based on task type
        if (batchIndex === 0) {
          // Initialize with the first batch
          processedData = processDataForTaskType(taskType, batch);
        } else {
          // Update existing processed data with this batch
          updateProcessedData(processedData, taskType, batch);
        }
        
        // Update progress
        processedCount += batch.length;
        console.log(`Processed batch ${batchIndex + 1}/${totalBatches}, ${processedCount}/${totalCount} records`);
        
        if (progressCallback) {
          progressCallback({
            stage: "processing",
            status: "in_progress",
            progress: {
              processedCount,
              totalCount,
              batchIndex: batchIndex + 1,
              totalBatches,
              completedPercentage: (processedCount / totalCount) * 100
            },
            message: `Processing ${taskType}: ${processedCount}/${totalCount} records (${Math.round((processedCount / totalCount) * 100)}%)...`
          });
        }
        
        // Move to the next batch or complete
        batchIndex++;
        if (batchIndex < totalBatches) {
          // Schedule the next batch with a small delay to keep the UI responsive
          setTimeout(processBatch, 10);
        } else {
          // All batches processed
          console.log(`Completed processing ${processedCount} records for ${taskType}`);
          
          if (progressCallback) {
            progressCallback({
              stage: "processing",
              status: "complete",
              progress: {
                processedCount,
                totalCount,
                completedPercentage: 100
              },
              message: `Completed processing ${processedCount} records for ${taskType}`
            });
          }
          
          resolve({
            processedData,
            totalCount,
            rawSample
          });
        }
      } catch (error) {
        console.error(`Error processing batch ${batchIndex + 1}:`, error);
        
        if (progressCallback) {
          progressCallback({
            stage: "processing",
            status: "error",
            message: `Error processing data: ${error.message}`
          });
        }
        
        reject(error);
      }
    }
    
    // Start the first batch
    processBatch();
  });
};

// Initial processor for different task types
const processDataForTaskType = (taskType, data) => {
  switch (taskType) {
    case "batteryHealth":
      return processBatteryHealthData(data);
    case "anomalyDetection":
      return processAnomalyData(data);
    case "energyOptimization":
      return processEnergyData(data);
    case "predictiveMaintenance":
      return processMaintenanceData(data);
    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
};

// Update processor for different task types
const updateProcessedData = (currentData, taskType, newData) => {
  // This function updates the current processed data with new batch data
  // The implementation depends on what each processing function returns
  // For this example we'll use simplified logic
  
  switch (taskType) {
    case "batteryHealth":
      updateBatteryHealthData(currentData, newData);
      break;
    case "anomalyDetection":
      updateAnomalyData(currentData, newData);
      break;
    case "energyOptimization":
      updateEnergyData(currentData, newData);
      break;
    case "predictiveMaintenance":
      updateMaintenanceData(currentData, newData);
      break;
    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
  
  return currentData;
};

// Helper function to update battery health data with new batch
const updateBatteryHealthData = (currentData, newData) => {
  // Process the new data and merge stats with current data
  const newStats = processBatteryHealthData(newData);
  
  // Update voltage stats
  currentData.voltageStats.min = Math.min(currentData.voltageStats.min, newStats.voltageStats.min);
  currentData.voltageStats.max = Math.max(currentData.voltageStats.max, newStats.voltageStats.max);
  
  // Update current stats
  currentData.currentStats.min = Math.min(currentData.currentStats.min, newStats.currentStats.min);
  currentData.currentStats.max = Math.max(currentData.currentStats.max, newStats.currentStats.max);
  
  // Update temperature stats
  currentData.temperatureStats.min = Math.min(currentData.temperatureStats.min, newStats.temperatureStats.min);
  currentData.temperatureStats.max = Math.max(currentData.temperatureStats.max, newStats.temperatureStats.max);
  
  // Merge SOC history
  currentData.socHistory = [...currentData.socHistory, ...newStats.socHistory]
    .sort((a, b) => a.timestamp - b.timestamp);
  
  // Add cycle counts
  currentData.cycleCount += newStats.cycleCount;
  
  // We'll keep the earliest estimatedAge
  if (newStats.estimatedAge < currentData.estimatedAge) {
    currentData.estimatedAge = newStats.estimatedAge;
  }
  
  // We need to recalculate averages and standard deviations at the end
  // This would be done in a final pass after all batches are processed
};

// Helper functions for other data types would be similar
const updateAnomalyData = (currentData, newData) => {
  // Implementation similar to updateBatteryHealthData
};

const updateEnergyData = (currentData, newData) => {
  // Implementation similar to updateBatteryHealthData
};

const updateMaintenanceData = (currentData, newData) => {
  // Implementation similar to updateBatteryHealthData
};

// Process battery health data
const processBatteryHealthData = (data) => {
  // Extract relevant parameters for battery health prediction
  const healthParameters = {
    voltageStats: {
      min: Number.MAX_VALUE,
      max: Number.MIN_VALUE,
      avg: 0,
      stdDev: 0,
    },
    currentStats: {
      min: Number.MAX_VALUE,
      max: Number.MIN_VALUE,
      avg: 0,
      stdDev: 0,
    },
    temperatureStats: {
      min: Number.MAX_VALUE,
      max: Number.MIN_VALUE,
      avg: 0,
      stdDev: 0,
    },
    cycleCount: 0,
    socHistory: [],
    estimatedAge: Number.MAX_VALUE, // In days
  };

  // Calculate actual values from the data
  let voltageSum = 0;
  let currentSum = 0;
  let tempSum = 0;
  let voltageValues = [];
  let currentValues = [];
  let tempValues = [];
  let cycleEvents = 0;

  data.forEach((item) => {
    // Process voltage
    const voltage = item.TotalBattVoltage?.N
      ? parseFloat(item.TotalBattVoltage.N)
      : 0;
    voltageSum += voltage;
    voltageValues.push(voltage);
    healthParameters.voltageStats.min = Math.min(
      healthParameters.voltageStats.min,
      voltage
    );
    healthParameters.voltageStats.max = Math.max(
      healthParameters.voltageStats.max,
      voltage
    );

    // Process current
    const current = item.TotalCurrent?.N ? parseFloat(item.TotalCurrent.N) : 0;
    currentSum += current;
    currentValues.push(current);
    healthParameters.currentStats.min = Math.min(
      healthParameters.currentStats.min,
      current
    );
    healthParameters.currentStats.max = Math.max(
      healthParameters.currentStats.max,
      current
    );

    // Process temperature
    const temp = item.MaxCellTemp?.N ? parseFloat(item.MaxCellTemp.N) : 0;
    tempSum += temp;
    tempValues.push(temp);
    healthParameters.temperatureStats.min = Math.min(
      healthParameters.temperatureStats.min,
      temp
    );
    healthParameters.temperatureStats.max = Math.max(
      healthParameters.temperatureStats.max,
      temp
    );

    // SOC history
    if (item.SOCPercent?.N) {
      healthParameters.socHistory.push({
        timestamp: parseInt(item.Timestamp.N),
        value: parseFloat(item.SOCPercent.N),
      });
    }

    // Detect charge cycles (crude approximation - when current changes from negative to positive)
    if (currentValues.length > 1 && currentValues[currentValues.length - 2] < 0 && current > 0) {
      cycleEvents++;
    }
  });

  // Calculate averages
  const count = data.length || 1; // Avoid division by zero
  healthParameters.voltageStats.avg = voltageSum / count;
  healthParameters.currentStats.avg = currentSum / count;
  healthParameters.temperatureStats.avg = tempSum / count;

  // Calculate standard deviations
  let voltageVarianceSum = 0;
  let currentVarianceSum = 0;
  let tempVarianceSum = 0;

  voltageValues.forEach(
    (v) =>
      (voltageVarianceSum += Math.pow(v - healthParameters.voltageStats.avg, 2))
  );
  currentValues.forEach(
    (c) =>
      (currentVarianceSum += Math.pow(c - healthParameters.currentStats.avg, 2))
  );
  tempValues.forEach(
    (t) =>
      (tempVarianceSum += Math.pow(t - healthParameters.temperatureStats.avg, 2))
  );

  healthParameters.voltageStats.stdDev = Math.sqrt(
    voltageVarianceSum / count
  );
  healthParameters.currentStats.stdDev = Math.sqrt(
    currentVarianceSum / count
  );
  healthParameters.temperatureStats.stdDev = Math.sqrt(
    tempVarianceSum / count
  );

  // Estimate cycle count - this is just an approximation
  healthParameters.cycleCount = cycleEvents;

  // Estimate battery age (if manufacture date is not available)
  // Use the earliest timestamp as a proxy for installation date
  if (data.length > 0) {
    const timestamps = data.map(item => parseInt(item.Timestamp.N));
    const earliestTimestamp = Math.min(...timestamps);
    const currentTime = Math.floor(Date.now() / 1000);
    healthParameters.estimatedAge = Math.floor((currentTime - earliestTimestamp) / 86400); // Convert to days
  }

  return healthParameters;
};

// Process anomaly detection data
const processAnomalyData = (data) => {
  const anomalyParameters = {
    recentReadings: [],
    internalResistanceValues: [],
    rateOfChange: {
      voltage: [],
      current: [],
      temperature: [],
    },
    normalOperationBounds: {
      voltage: { min: 0, max: 0 },
      current: { min: 0, max: 0 },
      temperature: { min: 0, max: 0 },
    },
  };

  // Get the most recent readings (last 24 hours)
  const now = Math.floor(Date.now() / 1000);
  const last24Hours = now - 86400;
  anomalyParameters.recentReadings = data
    .filter((item) => parseInt(item.Timestamp.N) > last24Hours)
    .map((item) => ({
      timestamp: parseInt(item.Timestamp.N),
      voltage: item.TotalBattVoltage?.N
        ? parseFloat(item.TotalBattVoltage.N)
        : null,
      current: item.TotalCurrent?.N ? parseFloat(item.TotalCurrent.N) : null,
      temperature: item.MaxCellTemp?.N ? parseFloat(item.MaxCellTemp.N) : null,
    }));

  // Calculate internal resistance (V/I) when current is not close to zero
  data.forEach((item) => {
    const voltage = item.TotalBattVoltage?.N
      ? parseFloat(item.TotalBattVoltage.N)
      : 0;
    const current = item.TotalCurrent?.N ? parseFloat(item.TotalCurrent.N) : 0;

    // Avoid division by very small numbers
    if (Math.abs(current) > 0.1) {
      const resistance = voltage / current;
      anomalyParameters.internalResistanceValues.push({
        timestamp: parseInt(item.Timestamp.N),
        value: resistance,
      });
    }
  });

  // Calculate rate of change for key parameters
  for (let i = 1; i < data.length; i++) {
    const currentItem = data[i];
    const prevItem = data[i - 1];
    
    const currentTime = parseInt(currentItem.Timestamp.N);
    const prevTime = parseInt(prevItem.Timestamp.N);
    const timeDiff = currentTime - prevTime;
    
    if (timeDiff > 0) {  // Ensure we don't divide by zero
      // Voltage rate of change
      if (currentItem.TotalBattVoltage?.N && prevItem.TotalBattVoltage?.N) {
        const voltChange = (parseFloat(currentItem.TotalBattVoltage.N) - parseFloat(prevItem.TotalBattVoltage.N)) / timeDiff;
        anomalyParameters.rateOfChange.voltage.push({
          timestamp: currentTime,
          value: voltChange,
        });
      }
      
      // Current rate of change
      if (currentItem.TotalCurrent?.N && prevItem.TotalCurrent?.N) {
        const currChange = (parseFloat(currentItem.TotalCurrent.N) - parseFloat(prevItem.TotalCurrent.N)) / timeDiff;
        anomalyParameters.rateOfChange.current.push({
          timestamp: currentTime,
          value: currChange,
        });
      }
      
      // Temperature rate of change
      if (currentItem.MaxCellTemp?.N && prevItem.MaxCellTemp?.N) {
        const tempChange = (parseFloat(currentItem.MaxCellTemp.N) - parseFloat(prevItem.MaxCellTemp.N)) / timeDiff;
        anomalyParameters.rateOfChange.temperature.push({
          timestamp: currentTime,
          value: tempChange,
        });
      }
    }
  }

  // Determine normal operation bounds (assuming data represents normal operation)
  const voltages = data
    .filter(item => item.TotalBattVoltage?.N)
    .map(item => parseFloat(item.TotalBattVoltage.N));
  
  const currents = data
    .filter(item => item.TotalCurrent?.N)
    .map(item => parseFloat(item.TotalCurrent.N));
  
  const temperatures = data
    .filter(item => item.MaxCellTemp?.N)
    .map(item => parseFloat(item.MaxCellTemp.N));

  // Calculate mean and standard deviation for normal bounds
  if (voltages.length > 0) {
    const vMean = voltages.reduce((sum, v) => sum + v, 0) / voltages.length;
    const vStdDev = Math.sqrt(voltages.reduce((sum, v) => sum + Math.pow(v - vMean, 2), 0) / voltages.length);
    anomalyParameters.normalOperationBounds.voltage = {
      min: vMean - 2 * vStdDev,  // 2 standard deviations below mean
      max: vMean + 2 * vStdDev,  // 2 standard deviations above mean
    };
  }
  
  if (currents.length > 0) {
    const cMean = currents.reduce((sum, c) => sum + c, 0) / currents.length;
    const cStdDev = Math.sqrt(currents.reduce((sum, c) => sum + Math.pow(c - cMean, 2), 0) / currents.length);
    anomalyParameters.normalOperationBounds.current = {
      min: cMean - 2 * cStdDev,
      max: cMean + 2 * cStdDev,
    };
  }
  
  if (temperatures.length > 0) {
    const tMean = temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length;
    const tStdDev = Math.sqrt(temperatures.reduce((sum, t) => sum + Math.pow(t - tMean, 2), 0) / temperatures.length);
    anomalyParameters.normalOperationBounds.temperature = {
      min: tMean - 2 * tStdDev,
      max: tMean + 2 * tStdDev,
    };
  }

  return anomalyParameters;
};

// Process energy optimization data
const processEnergyData = (data) => {
  const energyParameters = {
    usagePatterns: {
      hourly: Array(24).fill(0),  // Usage by hour of day
      daily: Array(7).fill(0),    // Usage by day of week
    },
    environmentalFactors: [],
    chargingPatterns: [],
    timeSeriesData: [],
  };

  // Extract timestamps and power data
  const timeSeriesPoints = data
    .filter(item => item.TotalBattVoltage?.N && item.TotalCurrent?.N)
    .map(item => {
      const timestamp = parseInt(item.Timestamp.N);
      const voltage = parseFloat(item.TotalBattVoltage.N);
      const current = parseFloat(item.TotalCurrent.N);
      const power = voltage * current; // Power in watts
      
      return {
        timestamp,
        power,
        date: new Date(timestamp * 1000)
      };
    });

  // Add time series data
  energyParameters.timeSeriesData = timeSeriesPoints.map(point => ({
    timestamp: point.timestamp,
    power: point.power
  }));

  // Analyze by hour of day
  timeSeriesPoints.forEach(point => {
    const hour = point.date.getHours();
    energyParameters.usagePatterns.hourly[hour] += Math.abs(point.power);
  });

  // Normalize hourly data
  const hourlySum = energyParameters.usagePatterns.hourly.reduce((sum, val) => sum + val, 0);
  if (hourlySum > 0) {
    energyParameters.usagePatterns.hourly = energyParameters.usagePatterns.hourly.map(
      val => val / hourlySum
    );
  }

  // Analyze by day of week
  timeSeriesPoints.forEach(point => {
    const dayOfWeek = point.date.getDay(); // 0 = Sunday, 6 = Saturday
    energyParameters.usagePatterns.daily[dayOfWeek] += Math.abs(point.power);
  });

  // Normalize daily data
  const dailySum = energyParameters.usagePatterns.daily.reduce((sum, val) => sum + val, 0);
  if (dailySum > 0) {
    energyParameters.usagePatterns.daily = energyParameters.usagePatterns.daily.map(
      val => val / dailySum
    );
  }

  // Extract environmental factors (using temperature as proxy)
  energyParameters.environmentalFactors = data
    .filter(item => item.MaxCellTemp?.N && item.Timestamp?.N)
    .map(item => ({
      timestamp: parseInt(item.Timestamp.N),
      temperature: parseFloat(item.MaxCellTemp.N)
    }));

  // Extract charging patterns (when current is negative)
  let isCharging = false;
  let chargeStartTime = null;

  data.forEach(item => {
    if (!item.TotalCurrent?.N || !item.Timestamp?.N) return;
    
    const current = parseFloat(item.TotalCurrent.N);
    const timestamp = parseInt(item.Timestamp.N);
    
    if (current < 0 && !isCharging) {
      // Charging started
      isCharging = true;
      chargeStartTime = timestamp;
    } else if (current >= 0 && isCharging) {
      // Charging ended
      isCharging = false;
      
      if (chargeStartTime) {
        const chargeDuration = timestamp - chargeStartTime;
        
        energyParameters.chargingPatterns.push({
          startTime: chargeStartTime,
          endTime: timestamp,
          duration: chargeDuration, // in seconds
          startDate: new Date(chargeStartTime * 1000),
          endDate: new Date(timestamp * 1000)
        });
        
        chargeStartTime = null;
      }
    }
  });

  return energyParameters;
};

// Process predictive maintenance data
const processMaintenanceData = (data) => {
  const maintenanceParameters = {
    statisticalPatterns: {
      voltage: {
        mean: 0,
        stdDev: 0,
        trend: []
      },
      current: {
        mean: 0,
        stdDev: 0,
        trend: []
      }
    },
    cycleInformation: {
      count: 0,
      depthOfDischarge: [],
      chargeDurations: [],
      dischargeDurations: []
    },
    temperatureExtremes: {
      max: 0,
      min: 100, // Start with a high value
      fluctuations: []
    },
    chargingEfficiency: []
  };

  // Extract voltage and current statistics
  const voltages = data
    .filter(item => item.TotalBattVoltage?.N)
    .map(item => parseFloat(item.TotalBattVoltage.N));
  
  const currents = data
    .filter(item => item.TotalCurrent?.N)
    .map(item => parseFloat(item.TotalCurrent.N));

  const temperatures = data
    .filter(item => item.MaxCellTemp?.N)
    .map(item => parseFloat(item.MaxCellTemp.N));

  // Calculate basic statistics
  if (voltages.length > 0) {
    maintenanceParameters.statisticalPatterns.voltage.mean = 
      voltages.reduce((sum, v) => sum + v, 0) / voltages.length;
    
    maintenanceParameters.statisticalPatterns.voltage.stdDev = 
      Math.sqrt(voltages.reduce((sum, v) => 
        sum + Math.pow(v - maintenanceParameters.statisticalPatterns.voltage.mean, 2), 0) / voltages.length);
  }

  if (currents.length > 0) {
    maintenanceParameters.statisticalPatterns.current.mean = 
      currents.reduce((sum, c) => sum + c, 0) / currents.length;
    
    maintenanceParameters.statisticalPatterns.current.stdDev = 
      Math.sqrt(currents.reduce((sum, c) => 
        sum + Math.pow(c - maintenanceParameters.statisticalPatterns.current.mean, 2), 0) / currents.length);
  }

  // Create voltage and current trends (moving averages)
  const windowSize = Math.min(24, Math.floor(data.length / 10)); // Use 10% of data points or 24, whichever is smaller
  if (windowSize > 0) {
    for (let i = windowSize; i < data.length; i++) {
      if (data[i].TotalBattVoltage?.N && data[i].Timestamp?.N) {
        // Calculate moving average for voltage
        let sum = 0;
        for (let j = 0; j < windowSize; j++) {
          if (data[i-j].TotalBattVoltage?.N) {
            sum += parseFloat(data[i-j].TotalBattVoltage.N);
          }
        }
        
        maintenanceParameters.statisticalPatterns.voltage.trend.push({
          timestamp: parseInt(data[i].Timestamp.N),
          value: sum / windowSize
        });
      }

      if (data[i].TotalCurrent?.N && data[i].Timestamp?.N) {
        // Calculate moving average for current
        let sum = 0;
        for (let j = 0; j < windowSize; j++) {
          if (data[i-j].TotalCurrent?.N) {
            sum += parseFloat(data[i-j].TotalCurrent.N);
          }
        }
        
        maintenanceParameters.statisticalPatterns.current.trend.push({
          timestamp: parseInt(data[i].Timestamp.N),
          value: sum / windowSize
        });
      }
    }
  }

  // Process temperature extremes
  if (temperatures.length > 0) {
    maintenanceParameters.temperatureExtremes.max = Math.max(...temperatures);
    maintenanceParameters.temperatureExtremes.min = Math.min(...temperatures);
  }

  // Calculate temperature fluctuations
  for (let i = 1; i < data.length; i++) {
    if (data[i].MaxCellTemp?.N && data[i-1].MaxCellTemp?.N && data[i].Timestamp?.N) {
      const currentTemp = parseFloat(data[i].MaxCellTemp.N);
      const prevTemp = parseFloat(data[i-1].MaxCellTemp.N);
      const tempChange = Math.abs(currentTemp - prevTemp);
      
      if (tempChange > 1) { // Only record significant changes (> 1 degree)
        maintenanceParameters.temperatureExtremes.fluctuations.push({
          timestamp: parseInt(data[i].Timestamp.N),
          change: tempChange
        });
      }
    }
  }

  // Track charge/discharge cycles
  let isCharging = false;
  let chargeStartTime = null;
  let dischargeStartTime = null;
  let chargeStartSOC = null;
  let dischargeStartSOC = null;
  let chargeStartEnergy = 0;
  let chargeEndEnergy = 0;

  data.forEach(item => {
    if (!item.TotalCurrent?.N || !item.Timestamp?.N) return;
    
    const current = parseFloat(item.TotalCurrent.N);
    const timestamp = parseInt(item.Timestamp.N);
    const soc = item.SOCPercent?.N ? parseFloat(item.SOCPercent.N) : null;
    const voltage = item.TotalBattVoltage?.N ? parseFloat(item.TotalBattVoltage.N) : 0;
    
    // Track energy for efficiency calculation
    const power = voltage * current; // W
    const energy = Math.abs(power); // Absolute energy
    
    if (current < 0 && !isCharging) {
      // Charging started
      isCharging = true;
      chargeStartTime = timestamp;
      chargeStartSOC = soc;
      
      // End discharge cycle if active
      if (dischargeStartTime !== null) {
        const dischargeDuration = timestamp - dischargeStartTime;
        
        maintenanceParameters.cycleInformation.dischargeDurations.push({
          startTime: dischargeStartTime,
          endTime: timestamp,
          duration: dischargeDuration // in seconds
        });
        
        // Calculate depth of discharge if SOC is available
        if (dischargeStartSOC !== null && soc !== null) {
          maintenanceParameters.cycleInformation.depthOfDischarge.push({
            startSOC: dischargeStartSOC,
            endSOC: soc,
            depth: dischargeStartSOC - soc
          });
        }
        
        dischargeStartTime = null;
        dischargeStartSOC = null;
        
        // Increment cycle count
        maintenanceParameters.cycleInformation.count++;
      }
      
      chargeStartEnergy = 0;
    } else if (current >= 0 && isCharging) {
      // Charging ended
      isCharging = false;
      
      if (chargeStartTime) {
        const chargeDuration = timestamp - chargeStartTime;
        
        maintenanceParameters.cycleInformation.chargeDurations.push({
          startTime: chargeStartTime,
          endTime: timestamp,
          duration: chargeDuration // in seconds
        });
        
        // Start discharge cycle
        dischargeStartTime = timestamp;
        dischargeStartSOC = soc;
        
        // Calculate charging efficiency if SOC data is available
        if (chargeStartSOC !== null && soc !== null && chargeEndEnergy > 0) {
          const socGain = soc - chargeStartSOC;
          
          if (socGain > 0) {
            maintenanceParameters.chargingEfficiency.push({
              cycle: maintenanceParameters.cycleInformation.count,
              startSOC: chargeStartSOC,
              endSOC: soc,
              duration: chargeDuration,
              efficiency: socGain / (chargeEndEnergy / 3600) // Efficiency in % per Wh
            });
          }
        }
        
        chargeStartTime = null;
        chargeStartSOC = null;
      }
    } else if (isCharging) {
      // During charging - accumulate energy
      chargeEndEnergy += energy;
    }
  });

  return maintenanceParameters;
};

// Main function to collect ML data with parallel processing
export const collectMLData = async (selectedTagId, selectedTimeRange, taskType, progressCallback) => {
  try {
    // Progress update: initialization
    if (progressCallback) {
      progressCallback({
        stage: "initializing",
        status: "in_progress",
        message: "Setting up data collection..."
      });
    }
    
    const session = await fetchAuthSession();
    const credentials = session.credentials;

    const dynamoDB = new AWS.DynamoDB({
      apiVersion: "2012-10-17",
      region: awsconfig.region,
      credentials,
    });

    // Calculate time range and create chunks for parallel processing
    const { startTime, endTime } = calculateTimeRange(selectedTimeRange);
    console.log(`Time range: ${new Date(startTime * 1000).toISOString()} to ${new Date(endTime * 1000).toISOString()}`);
    
    // For longer time ranges, use more chunks
    const numChunks = selectedTimeRange === "1year" ? 12 : 
                      selectedTimeRange === "6months" ? 6 : 
                      selectedTimeRange === "3months" ? 4 : 2;
    
    const chunks = createTimeChunks(startTime, endTime, numChunks);
    
    // Progress update: fetching with chunks
    if (progressCallback) {
      progressCallback({
        stage: "fetching",
        status: "in_progress",
        message: `Starting data collection with ${numChunks} parallel chunks...`,
        progress: {
          chunks: numChunks,
          completedChunks: 0,
          completedPercentage: 0
        }
      });
    }
    
    // Fetch data from all chunks in parallel
    const chunkPromises = chunks.map((chunk) => 
      fetchChunkData(
        dynamoDB,
        "CAN_BMS_Data",
        `BAT-${selectedTagId}`,
        chunk,
        (progress) => {
          if (progressCallback) {
            // Calculate overall progress based on chunk progress
            const overallProgress = {
              stage: "fetching",
              status: progress.status,
              message: progress.message,
              progress: {
                chunks: numChunks,
                currentChunk: progress.chunk.index + 1,
                completedChunks: progress.status === "complete" ? progress.chunk.index + 1 : progress.chunk.index,
                completedPercentage: Math.floor(((progress.chunk.index * 100) + 
                  (progress.status === "complete" ? 100 : (progress.itemCount / 100) * 100)) / numChunks)
              }
            };
            
            progressCallback(overallProgress);
          }
        }
      )
    );
    
    // Wait for all chunks to complete
    console.log(`Waiting for ${numChunks} chunks to complete...`);
    const chunkResults = await Promise.all(chunkPromises);
    const totalItems = chunkResults.reduce((sum, chunk) => sum + chunk.count, 0);
    console.log(`All chunks completed. Total items: ${totalItems}`);
    
    // Progress update: processing
    if (progressCallback) {
      progressCallback({
        stage: "processing",
        status: "in_progress",
        message: `Processing ${totalItems} records for ${taskType}...`,
        progress: {
          totalItems,
          completedPercentage: 0
        }
      });
    }
    
    // Process the data in streaming fashion
    console.log(`Starting stream processing for ${taskType}...`);
    const processedResult = await streamProcessData(
      taskType, 
      chunkResults,
      (progress) => {
        if (progressCallback) {
          progressCallback({
            stage: "processing",
            status: progress.status,
            message: progress.message,
            progress: progress.progress
          });
        }
      }
    );
    console.log(`Stream processing completed for ${taskType}`);
    
    // Progress update: completed
    if (progressCallback) {
      progressCallback({
        stage: "completed",
        status: "complete",
        message: `Successfully processed ${totalItems} records for ${taskType}`
      });
    }

    return {
      meta: {
        tagId: selectedTagId,
        timeRange: selectedTimeRange,
        dataPoints: totalItems,
        chunks: numChunks,
        startTime,
        endTime,
      },
      rawData: chunkResults.reduce((all, chunk) => all.concat(chunk.items), []),
      rawSampleData: processedResult.rawSample,
      processedData: processedResult.processedData,
    };
  } catch (error) {
    console.error("Error collecting ML data:", error);
    
    // Progress update: error
    if (progressCallback) {
      progressCallback({
        stage: "error",
        status: "error",
        message: `Error: ${error.message}`
      });
    }
    
    throw error;
  }
};

export default {
  collectMLData,
  processBatteryHealthData,
  processAnomalyData,
  processEnergyData,
  processMaintenanceData,
};