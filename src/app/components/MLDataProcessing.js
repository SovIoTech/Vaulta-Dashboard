// Calculate time range based on selection
export const calculateTimeRange = (timeRange) => {
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
  export const createTimeChunks = (startTime, endTime, numChunks = 4) => {
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
  export const fetchChunkData = async (dynamoDB, tableName, tagID, chunk, progressCallback) => {
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
  // Initial processor for different task types
  export const processDataForTaskType = (taskType, data) => {
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
  export const updateProcessedData = (currentData, taskType, newData) => {
    // This function updates the current processed data with new batch data
    // The implementation depends on what each processing function returns
    
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
  
  export const streamProcessData = (taskType, chunks, progressCallback) => {
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