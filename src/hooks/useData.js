// src/hooks/useData.js
import { useState, useEffect, useCallback } from "react";
import dataService from "../services/data.service.js";
import config from "../config/index.js";

export const useData = (
  tagID = config.app.defaultTagId,
  autoRefresh = true
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await dataService.getBMSData(tagID);

      if (result.success) {
        setData(result);
        setLastUpdate(new Date());
      } else {
        // Handle error state
        setData(null);
        setError(result.error || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Data fetch error:", err);
      setData(null);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [tagID]);

  const refreshData = useCallback(() => {
    dataService.clearCache();
    fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, config.app.refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, autoRefresh]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refreshData,
    fetchData,
    hasData: !!data?.lastMinuteData,
  };
};

export const useTimeRangeData = (tagID, timeRange) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!tagID || !timeRange) return;

    try {
      setLoading(true);
      setError(null);

      const result = await dataService.getDataByTimeRange(tagID, timeRange);
      const processed = dataService.processRawData(result);
      setData(processed);
    } catch (err) {
      console.error("Time range data fetch error:", err);
      setData(null);
      setError(err.message || "Failed to fetch time range data");
    } finally {
      setLoading(false);
    }
  }, [tagID, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    hasData: !!data,
  };
};

export default useData;
