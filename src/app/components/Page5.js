import React, { useState } from "react";
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
import { invokeLambdaFunction } from "../../calc/lastmonthdata.js"; // Import the Lambda invoker function
import { CCol, CRow, CWidgetStatsC } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilChartPie,
  cilBolt,
  cibGrafana,
  cilBatteryFull,
} from "@coreui/icons";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Page5 = ({ signOut }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState("0x440"); // Default TagID
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [lambdaResponse, setLambdaResponse] = useState(null); // State to store Lambda response
  const [progressPercentage, setProgressPercentage] = useState(0); // Progress percentage
  const [activeSection, setActiveSection] = useState("keyInsights"); // Active section for single-page app

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

  // Function to handle fetching data
  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    setProgressPercentage(0); // Reset progress

    try {
      // Invoke the Lambda function
      const response = await invokeLambdaFunction(selectedTagId);

      // Update state with the Lambda response
      setLambdaResponse(response);

      // Calculate progress percentage (example: assume 100% completion)
      setProgressPercentage(100);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const CardItem = ({ label, value, icon, color }) => (
    <div
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
        <div
          style={{
            marginRight: "15px",
            color: color || "#333",
            fontSize: "24px",
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <div style={{ color: "#666", fontSize: "14px" }}>{label}</div>
        <div style={{ fontWeight: "bold", fontSize: "16px" }}>{value}</div>
      </div>
    </div>
  );

  const KeyInsightsCard = ({ data }) => {
    const dailyPowerSummary = Object.values(data.dailyPowerSummary)[0]; // Assuming one day's data
    const hourlyPower = Object.values(data.hourlyPower);
    const chargingHours = data.chargingHours;

    // Calculate metrics
    const peakPowerConsumption = Math.max(
      ...hourlyPower.map((hour) => hour.Power)
    );
    const peakChargingPower = Math.min(
      ...hourlyPower.map((hour) => hour.Power)
    );
    const currentPowerStatus =
      hourlyPower[hourlyPower.length - 1].Power > 0 ? "Consuming" : "Charging";
    const avgBatteryVoltage =
      hourlyPower.reduce((sum, hour) => sum + hour.TotalBattVoltage, 0) /
      hourlyPower.length;
    const avgLoadVoltage =
      hourlyPower.reduce((sum, hour) => sum + hour.TotalLoadVoltage, 0) /
      hourlyPower.length;
    const totalChargingHours = chargingHours.length;
    const lastChargingEvent =
      chargingHours[chargingHours.length - 1]?.hour || "N/A";
    const systemEfficiency =
      (dailyPowerSummary.TotalPower /
        (dailyPowerSummary.TotalPower + Math.abs(peakChargingPower))) *
      100;
    const carbonOffset = dailyPowerSummary.TotalPower * 0.0005; // Example calculation

    const cardSections = [
      {
        title: "Daily Power Summary",
        items: [
          {
            label: "Total Power Consumed",
            value: `${dailyPowerSummary.TotalPower.toFixed(2)} Wh`,
            icon: "⚡",
            color: "#2196F3",
          },
          {
            label: "Average Power Consumption",
            value: `${dailyPowerSummary.AveragePower.toFixed(2)} W`,
            icon: "📊",
            color: "#4CAF50",
          },
          {
            label: "Positive Hours",
            value: `${dailyPowerSummary.PositiveHours} hrs`,
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
            value: `${peakPowerConsumption.toFixed(2)} W`,
            icon: "📈",
            color: "#F44336",
          },
          {
            label: "Peak Charging Power",
            value: `${peakChargingPower.toFixed(2)} W`,
            icon: "🔋",
            color: "#9C27B0",
          },
          {
            label: "Current Power Status",
            value: currentPowerStatus,
            icon: currentPowerStatus === "Consuming" ? "🔌" : "🔋",
            color: currentPowerStatus === "Consuming" ? "#FF9800" : "#4CAF50",
          },
        ],
      },
      {
        title: "Battery & Load Voltage",
        items: [
          {
            label: "Avg Battery Voltage",
            value: `${avgBatteryVoltage.toFixed(2)} V`,
            icon: "🔋",
            color: "#2196F3",
          },
          {
            label: "Avg Load Voltage",
            value: `${avgLoadVoltage.toFixed(2)} V`,
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
            value: `${totalChargingHours} hrs`,
            icon: "⏳",
            color: "#9C27B0",
          },
          {
            label: "Last Charging Event",
            value: lastChargingEvent,
            icon: "🔋",
            color: "#FF9800",
          },
        ],
      },
      {
        title: "System Health",
        items: [
          {
            label: "System Efficiency",
            value: `${systemEfficiency.toFixed(2)}%`,
            icon: "📉",
            color: "#F44336",
          },
          {
            label: "Carbon Offset",
            value: `${carbonOffset.toFixed(2)} kg`,
            icon: "🌍",
            color: "#4CAF50",
          },
        ],
      },
    ];

    return (
      <div
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
              textAlign: "left",
            }}
          >
            <h3
              style={{
                fontWeight: "bold",
                marginBottom: "15px",
                color: "#333",
                borderBottom: "2px solid #f0f0f0",
                paddingBottom: "10px",
              }}
            >
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
      </div>
    );
  };

  const HourlyAveragesBarChart = ({ data }) => {
    const last24Hours = Object.entries(data.hourlyAverages).slice(-24);

    // Combine currents and handle zero values
    const combinedData = last24Hours.map(([_, hour]) => {
      const value = hour.TotalCurrent;
      // For zero values, use a minimal height (0.1) and black color
      return Math.abs(value) < 0.01
        ? { value: 0.1, color: "#000000" }
        : { value, color: value > 0 ? "#28a745" : "#dc3545" };
    });

    const chartData = {
      labels: last24Hours.map((_, index) => `-${24 - index} hr`),
      datasets: [
        {
          label: "Hourly Current",
          data: combinedData.map((d) => d.value),
          backgroundColor: combinedData.map((d) => d.color),
          borderColor: combinedData.map((d) => d.color),
          borderWidth: 1,
          categoryPercentage: 1.0, // Full width for category
          barPercentage: 0.9, // Full width for bars
        },
      ],
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true, // Now starting at zero to show minimal bars
          grid: {
            color: "#e0e0e0",
          },
          ticks: {
            callback: function (value) {
              // Hide tick for minimal zero bars
              return value === 0.1 ? "" : value;
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            autoSkip: false,
            maxRotation: 0,
          },
        },
      },
      plugins: {
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (context) {
              const value = context.raw === 0.1 ? 0 : context.raw;
              return `Current: ${value.toFixed(2)}A`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
      maintainAspectRatio: false,
    };

    return (
      <div
        style={{
          backgroundColor: "#f9f9f9",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          marginBottom: "20px",
          position: "relative",
          height: "400px",
        }}
      >
        <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>
          Hourly Averages (Last 24 Hours)
        </h3>
        <div style={{ height: "350px" }}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    );
  };

  // Daily Power Summary Table
  const DailyPowerSummaryTable = ({ data }) => {
    return (
      <div
        style={{
          backgroundColor: "#f9f9f9",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>
          Daily Power Summary
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr>
              <th
                style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}
              >
                Date
              </th>
              <th
                style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}
              >
                Total Power
              </th>
              <th
                style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}
              >
                Positive Hours
              </th>
              <th
                style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}
              >
                Average Power
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.dailyPowerSummary).map(([date, summary]) => (
              <tr key={date}>
                <td
                  style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}
                >
                  {date}
                </td>
                <td
                  style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}
                >
                  {summary.TotalPower.toFixed(2)} kWh
                </td>
                <td
                  style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}
                >
                  {summary.PositiveHours}
                </td>
                <td
                  style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}
                >
                  {summary.AveragePower.toFixed(2)} kW
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        color: "#1e1e2f",
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
          backgroundColor: "#ffffff",
          maxWidth: "calc(100% - 80px)",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#1e1e2f",
            marginBottom: "20px",
          }}
        >
          Consumption Trends
        </h1>

        {/* TagID Dropdown */}
        <div
          style={{
            backgroundColor: "#f9f9f9",
            padding: "10px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            marginBottom: "20px",
          }}
        >
          <label
            htmlFor="tagId"
            style={{
              fontSize: "14px",
              color: "#666666",
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
              border: "1px solid #e0e0e0",
              width: "100%",
              fontSize: "14px",
              color: "#1e1e2f",
              backgroundColor: "#ffffff",
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

        {/* Buttons to fetch data */}
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
              backgroundColor: "#696cff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "background-color 0.3s ease",
            }}
            disabled={loading}
          >
            {loading ? "Fetching Data..." : "Fetch Data"}
          </button>
        </div>

        {/* Progress Bar and Progress Text */}
        {progressPercentage < 100 && (
          <>
            <div
              style={{
                marginBottom: "20px",
                backgroundColor: "#e9ecef",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressPercentage}%`,
                  height: "10px",
                  backgroundColor: "#696cff",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {/* Display Progress */}
            <p
              style={{
                fontSize: "14px",
                color: "#666666",
                textAlign: "center",
              }}
            >
              Progress: {progressPercentage.toFixed(2)}%
            </p>
          </>
        )}

        {/* Display Completion Message */}
        {progressPercentage === 100 && (
          <p
            style={{
              fontSize: "14px",
              color: "#28a745",
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
              color: "#dc3545",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        {/* Navigation Buttons */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setActiveSection("keyInsights")}
            style={{
              padding: "10px 20px",
              backgroundColor:
                activeSection === "keyInsights" ? "#696cff" : "#e9ecef",
              color: activeSection === "keyInsights" ? "white" : "#1e1e2f",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "background-color 0.3s ease",
            }}
          >
            Key Insights
          </button>
          <button
            onClick={() => setActiveSection("hourlyAverages")}
            style={{
              padding: "10px 20px",
              backgroundColor:
                activeSection === "hourlyAverages" ? "#696cff" : "#e9ecef",
              color: activeSection === "hourlyAverages" ? "white" : "#1e1e2f",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "background-color 0.3s ease",
            }}
          >
            Hourly Averages
          </button>
          <button
            onClick={() => setActiveSection("dailySummary")}
            style={{
              padding: "10px 20px",
              backgroundColor:
                activeSection === "dailySummary" ? "#696cff" : "#e9ecef",
              color: activeSection === "dailySummary" ? "white" : "#1e1e2f",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "background-color 0.3s ease",
            }}
          >
            Daily Summary
          </button>
        </div>

        {/* Display Lambda Response */}
        {lambdaResponse && (
          <div>
            {activeSection === "keyInsights" && (
              <KeyInsightsCard data={lambdaResponse} />
            )}
            {activeSection === "hourlyAverages" && (
              <HourlyAveragesBarChart data={lambdaResponse} />
            )}
            {activeSection === "dailySummary" && (
              <DailyPowerSummaryTable data={lambdaResponse} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page5;
