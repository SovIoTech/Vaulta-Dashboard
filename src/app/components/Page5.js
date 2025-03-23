import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar.js";
import { getLastMonthData } from "../../calc/lastmonthdata.js"; // Import the getLastMonthData function

const Page5 = ({ signOut }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState("0x440"); // Default TagID
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [fetchedItemsCount, setFetchedItemsCount] = useState(0); // Track the number of fetched items
  const [isFetching, setIsFetching] = useState(false); // Track if fetching is in progress
  const [abortFetch, setAbortFetch] = useState(false); // Track if fetch should be aborted
  const [isQueryComplete, setIsQueryComplete] = useState(false); // Track if query is complete

  // Calculate total expected items (6 items per minute for 30 days)
  const totalExpectedItems = 6 * 60 * 24 * 30; // 259,200 items

  // List of TagIDs
  const baseIds = [
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
  ];

  // Reset state on page refresh
  useEffect(() => {
    setFetchedItemsCount(0);
    setIsFetching(false);
    setAbortFetch(false);
    setIsQueryComplete(false); // Reset query completion state
  }, []);

  // Function to handle fetching data
  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    setFetchedItemsCount(0); // Reset the fetched items count
    setIsFetching(true); // Set fetching state to true
    setAbortFetch(false); // Reset abort flag
    setIsQueryComplete(false); // Reset query completion state

    try {
      const data = await getLastMonthData(
        selectedTagId,
        (batchSize, totalItems) => {
          // Update the fetched items count dynamically
          setFetchedItemsCount(totalItems);
          console.log(
            `Fetched ${batchSize} items in this batch. Total items: ${totalItems}`
          );

          // Check if the fetch process should be aborted
          if (abortFetch) {
            console.log("Fetch process aborted by user.");
            throw new Error("Fetch process aborted by user.");
          }
        }
      );

      console.log("Fetched Data:", data); // Log the fetched data to the console

      // Set progress to 100% and mark query as complete
      setFetchedItemsCount(totalExpectedItems);
      setIsQueryComplete(true);
    } catch (error) {
      if (error.message !== "Fetch process aborted by user.") {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
      }
    } finally {
      setLoading(false);
      setIsFetching(false); // Reset fetching state
    }
  };

  // Function to stop the fetch process
  const handleStopFetch = () => {
    setAbortFetch(true); // Set abort flag to true
    setIsFetching(false); // Reset fetching state
    setLoading(false); // Reset loading state
    console.log("Fetch process stopped.");
  };

  // Calculate progress percentage
  const progressPercentage = (fetchedItemsCount / totalExpectedItems) * 100;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#ffffff", // White background
        color: "#1e1e2f", // Dark text
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        signOut={signOut}
      />
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#ffffff", // White background
          maxWidth: "calc(100% - 80px)",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#1e1e2f", // Dark text
            marginBottom: "20px",
          }}
        >
          Page 5
        </h1>

        {/* TagID Dropdown */}
        <div
          style={{
            backgroundColor: "#f9f9f9", // Light card background
            padding: "10px",
            borderRadius: "12px", // Rounded corners
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Soft shadow
            marginBottom: "20px",
          }}
        >
          <label
            htmlFor="tagId"
            style={{
              fontSize: "14px",
              color: "#666666", // Gray text for labels
              marginBottom: "5px",
              display: "block",
            }}
          >
            Select TagID:
          </label>
          <select
            id="tagId"
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #e0e0e0", // Light border
              width: "100%",
              fontSize: "14px",
              color: "#1e1e2f", // Dark text
              backgroundColor: "#ffffff", // White background
              cursor: "pointer",
            }}
          >
            {baseIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons to fetch data and stop fetch */}
        <div
          style={{
            marginBottom: "20px",
            textAlign: "center",
            display: "flex",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleFetchData}
            style={{
              padding: "10px 20px",
              backgroundColor: "#696cff", // Accent color
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Soft shadow
              transition: "background-color 0.3s ease",
            }}
            disabled={loading || isFetching} // Disable the button while loading or fetching
          >
            {loading ? "Fetching Data..." : "Fetch Data"}
          </button>
          <button
            onClick={handleStopFetch}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545", // Red color for stop button
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Soft shadow
              transition: "background-color 0.3s ease",
            }}
            disabled={!isFetching} // Disable the stop button if not fetching
          >
            Stop Fetch
          </button>
        </div>

        {/* Progress Bar and Progress Text */}
        {!isQueryComplete && (
          <>
            <div
              style={{
                marginBottom: "20px",
                backgroundColor: "#e9ecef", // Light gray background
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressPercentage}%`, // Dynamically set width based on progress
                  height: "10px",
                  backgroundColor: "#696cff", // Accent color
                  transition: "width 0.3s ease", // Smooth transition
                }}
              />
            </div>

            {/* Display Progress */}
            <p
              style={{
                fontSize: "14px",
                color: "#666666", // Gray text
                textAlign: "center",
              }}
            >
              Fetched {fetchedItemsCount} of {totalExpectedItems} items (
              {progressPercentage.toFixed(2)}%)
            </p>
          </>
        )}

        {/* Display Completion Message */}
        {isQueryComplete && (
          <p
            style={{
              fontSize: "14px",
              color: "#28a745", // Green text for success
              textAlign: "center",
            }}
          >
            Data fetch completed successfully!
          </p>
        )}

        {/* Display Error */}
        {error && (
          <p
            style={{
              fontSize: "14px",
              color: "#dc3545", // Red text for errors
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default Page5;
