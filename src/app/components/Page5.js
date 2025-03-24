import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Sidebar from "./Sidebar.js";
import { motion } from "framer-motion";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Page5 = ({ signOut, bmsData, lambdaResponse }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("keyInsights");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lambdaResponse && bmsData) {
      setLoading(false);
    }
  }, [lambdaResponse, bmsData]);

  // Helper functions for data processing
  const getLatestHourData = () => {
    if (!lambdaResponse?.hourlyPower) return null;
    const hourlyEntries = Object.entries(lambdaResponse.hourlyPower);
    return hourlyEntries.length > 0
      ? {
          timestamp: hourlyEntries[hourlyEntries.length - 1][0],
          ...hourlyEntries[hourlyEntries.length - 1][1],
        }
      : null;
  };

  const getLast24Hours = () => {
    if (!lambdaResponse?.hourlyAverages) return [];

    // Group by date
    const groupedByDate = Object.entries(lambdaResponse.hourlyAverages).reduce(
      (acc, [timestamp, data]) => {
        const date = timestamp.split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push({ timestamp, ...data });
        return acc;
      },
      {}
    );

    // Get the latest day's data
    const dates = Object.keys(groupedByDate).sort();
    const latestDate = dates[dates.length - 1];
    return groupedByDate[latestDate]?.slice(-24) || [];
  };

  const getAllDailySummaries = () => {
    if (!lambdaResponse?.dailyPowerSummary) return [];
    return Object.entries(lambdaResponse.dailyPowerSummary).sort(
      (a, b) => new Date(a[0]) - new Date(b[0])
    );
  };

  // Card component
  const CardItem = ({ label, value, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "15px",
        margin: "10px 0",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      {icon && (
        <div style={{ marginRight: "15px", color: color, fontSize: "24px" }}>
          {icon}
        </div>
      )}
      <div>
        <div style={{ color: "#666", fontSize: "14px" }}>{label}</div>
        <div style={{ fontWeight: "bold", fontSize: "16px" }}>{value}</div>
      </div>
    </motion.div>
  );

  // Key Insights Component (with all original metrics)
  const KeyInsightsCard = () => {
    const latestHour = getLatestHourData();
    const last24Hours = getLast24Hours();
    const dailySummaries = getAllDailySummaries();
    const latestDailySummary = dailySummaries[dailySummaries.length - 1]?.[1];
    const chargingHours = lambdaResponse?.chargingHours || [];

    if (!latestHour || !latestDailySummary) return null;

    // Calculate all original metrics
    const metrics = {
      // Daily Power Summary
      totalPowerConsumed: `${latestDailySummary.TotalPower.toFixed(2)} Wh`,
      avgPowerConsumption: `${latestDailySummary.AveragePower.toFixed(2)} W`,
      positiveHours: `${latestDailySummary.PositiveHours} hrs`,

      // Hourly Power Insights
      peakPowerConsumption: `${Math.max(
        ...last24Hours.map((h) => h.TotalCurrent)
      ).toFixed(2)} A`,
      peakChargingPower: `${Math.min(
        ...last24Hours.map((h) => h.TotalCurrent)
      ).toFixed(2)} A`,
      currentPowerStatus: latestHour.Power > 0 ? "Consuming" : "Charging",

      // Battery & Load Voltage
      avgBatteryVoltage: `${(
        last24Hours.reduce((sum, h) => sum + h.TotalBattVoltage, 0) /
        last24Hours.length
      ).toFixed(2)} V`,
      avgLoadVoltage: `${(
        last24Hours.reduce((sum, h) => sum + h.TotalLoadVoltage, 0) /
        last24Hours.length
      ).toFixed(2)} V`,

      // Charging Insights
      totalChargingHours: `${chargingHours.length} hrs`,
      lastChargingEvent: chargingHours[chargingHours.length - 1]?.hour || "N/A",

      // System Health
      systemHealth: `${parseFloat(
        bmsData?.lastMinuteData[0]?.SOH_Estimate?.N || 0
      ).toFixed(2)}%`,
      carbonOffset: `${parseFloat(
        bmsData?.lastMinuteData[0]?.Carbon_Offset_kg?.N || 0
      ).toFixed(2)} kg`,
    };

    const cardSections = [
      {
        title: "Daily Power Summary",
        items: [
          {
            label: "Total Power Consumed",
            value: metrics.totalPowerConsumed,
            icon: "⚡",
            color: "#2196F3",
          },
          {
            label: "Average Power Consumption",
            value: metrics.avgPowerConsumption,
            icon: "📊",
            color: "#4CAF50",
          },
          {
            label: "Positive Hours",
            value: metrics.positiveHours,
            icon: "⏱️",
            color: "#FF9800",
          },
        ],
      },
      {
        title: "Hourly Power Insights",
        items: [
          {
            label: "Peak Power Consumption",
            value: metrics.peakPowerConsumption,
            icon: "📈",
            color: "#F44336",
          },
          {
            label: "Peak Charging Power",
            value: metrics.peakChargingPower,
            icon: "🔋",
            color: "#9C27B0",
          },
          {
            label: "Current Power Status",
            value: metrics.currentPowerStatus,
            icon: metrics.currentPowerStatus === "Consuming" ? "🔌" : "🔋",
            color:
              metrics.currentPowerStatus === "Consuming"
                ? "#FF9800"
                : "#4CAF50",
          },
        ],
      },
      {
        title: "Battery & Load Voltage",
        items: [
          {
            label: "Avg Battery Voltage",
            value: metrics.avgBatteryVoltage,
            icon: "🔋",
            color: "#2196F3",
          },
          {
            label: "Avg Load Voltage",
            value: metrics.avgLoadVoltage,
            icon: "🔌",
            color: "#4CAF50",
          },
        ],
      },
      {
        title: "Charging Insights",
        items: [
          {
            label: "Total Charging Hours",
            value: metrics.totalChargingHours,
            icon: "⏳",
            color: "#9C27B0",
          },
          {
            label: "Last Charging Event",
            value: metrics.lastChargingEvent,
            icon: "🔋",
            color: "#FF9800",
          },
        ],
      },
      {
        title: "System Health",
        items: [
          {
            label: "System Health (SOH)",
            value: metrics.systemHealth,
            icon: "📉",
            color: "#F44336",
          },
          {
            label: "Carbon Offset",
            value: metrics.carbonOffset,
            icon: "🌍",
            color: "#4CAF50",
          },
        ],
      },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {cardSections.map((section, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
              padding: "20px",
            }}
          >
            <h3 style={{ fontWeight: "bold", marginBottom: "15px" }}>
              {section.title}
            </h3>
            {section.items.map((item, i) => (
              <CardItem
                key={i}
                label={item.label}
                value={item.value}
                icon={item.icon}
                color={item.color}
              />
            ))}
          </div>
        ))}
      </motion.div>
    );
  };

  // Hourly Averages Chart Component
  const HourlyAveragesChart = () => {
    const last24Hours = getLast24Hours();

    const chartData = {
      labels: last24Hours.map((_, i) => `-${24 - i} hr`),
      datasets: [
        {
          label: "Current (A)",
          data: last24Hours.map((h) => h.TotalCurrent),
          backgroundColor: last24Hours.map((h) =>
            h.TotalCurrent > 0 ? "#28a745" : "#dc3545"
          ),
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "#e0e0e0",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `Current: ${context.raw.toFixed(2)}A`,
          },
        },
      },
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: "#f9f9f9",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          marginBottom: "20px",
          height: "400px",
        }}
      >
        <h3 style={{ marginBottom: "15px" }}>Hourly Current (Last 24 Hours)</h3>
        <div style={{ height: "350px" }}>
          <Bar data={chartData} options={options} />
        </div>
      </motion.div>
    );
  };

  // Daily Summary Table Component
  const DailySummaryTable = () => {
    const dailySummaries = getAllDailySummaries();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: "#f9f9f9",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ marginBottom: "15px" }}>Daily Power Summary</h3>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "600px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  Total Power
                </th>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  Positive Hours
                </th>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  Avg Power
                </th>
              </tr>
            </thead>
            <tbody>
              {dailySummaries.map(([date, summary]) => (
                <tr key={date}>
                  <td
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    {date}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    {summary.TotalPower.toFixed(2)} Wh
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    {summary.PositiveHours}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    {summary.AveragePower.toFixed(2)} W
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  // Loading Screen Component
  const LoadingScreen = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h2 style={{ marginBottom: "20px" }}>Loading consumption data...</h2>
        <p>Please wait while we process the latest trends</p>
      </div>
    </motion.div>
  );

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", backgroundColor: "#fff" }}
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        signOut={signOut}
      />

      <div style={{ flex: 1, padding: "20px", maxWidth: "calc(100% - 80px)" }}>
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "20px",
              }}
            >
              Consumption Trends
            </h1>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                justifyContent: "center",
              }}
            >
              {["keyInsights", "hourlyAverages", "dailySummary"].map(
                (section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    style={{
                      padding: "10px 20px",
                      backgroundColor:
                        activeSection === section ? "#696cff" : "#e9ecef",
                      color: activeSection === section ? "white" : "#1e1e2f",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    {section === "keyInsights" && "Key Insights"}
                    {section === "hourlyAverages" && "Hourly Averages"}
                    {section === "dailySummary" && "Daily Summary"}
                  </button>
                )
              )}
            </div>

            {activeSection === "keyInsights" && <KeyInsightsCard />}
            {activeSection === "hourlyAverages" && <HourlyAveragesChart />}
            {activeSection === "dailySummary" && <DailySummaryTable />}
          </>
        )}
      </div>
    </div>
  );
};

export default Page5;
