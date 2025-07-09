import React from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { theme } from "../../styles/theme.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const UniversalChart = ({
  type = "line", // line, bar, pie
  data,
  title,
  height = 300,
  showLegend = false,
  showGrid = true,
  colors = theme.colors,
  customOptions = {},
  responsive = true,
  maintainAspectRatio = false,
}) => {
  // Base chart options
  const baseOptions = {
    responsive,
    maintainAspectRatio,
    plugins: {
      legend: {
        display: showLegend,
        position: "top",
        labels: {
          color: colors.textDark,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: colors.textDark,
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: colors.secondary,
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: "600",
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
      },
      title: {
        display: !!title,
        text: title,
        color: colors.textDark,
        font: {
          size: 16,
          weight: "600",
        },
      },
    },
    scales: {
      x: {
        display: type !== "pie",
        grid: {
          display: showGrid && type !== "pie",
          color: colors.background,
          drawBorder: false,
        },
        ticks: {
          color: colors.textLight,
          font: {
            size: 11,
            weight: "500",
          },
        },
      },
      y: {
        display: type !== "pie",
        grid: {
          display: showGrid && type !== "pie",
          color: colors.background,
          drawBorder: false,
        },
        ticks: {
          color: colors.textLight,
          font: {
            size: 11,
            weight: "500",
          },
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        backgroundColor: "#fff",
      },
      bar: {
        borderRadius: 4,
        borderWidth: 1,
      },
    },
    ...customOptions,
  };

  // Process data to ensure proper color application
  const processedData = {
    ...data,
    datasets:
      data.datasets?.map((dataset, index) => ({
        ...dataset,
        borderColor: dataset.borderColor || colors.primary,
        backgroundColor:
          dataset.backgroundColor ||
          (type === "pie" ? `${colors.primary}80` : `${colors.primary}20`),
        pointBorderColor: dataset.pointBorderColor || colors.primary,
        pointBackgroundColor: dataset.pointBackgroundColor || "#fff",
        ...(type === "bar" && {
          borderColor: dataset.borderColor || colors.primary,
          backgroundColor: dataset.backgroundColor || `${colors.primary}80`,
        }),
      })) || [],
  };

  // Chart component selection
  const renderChart = () => {
    switch (type) {
      case "bar":
        return <Bar data={processedData} options={baseOptions} />;
      case "pie":
        return <Pie data={processedData} options={baseOptions} />;
      case "line":
      default:
        return <Line data={processedData} options={baseOptions} />;
    }
  };

  return (
    <div
      style={{
        height: `${height}px`,
        width: "100%",
        padding: "10px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: `1px solid ${colors.secondary}`,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {renderChart()}
    </div>
  );
};

export default UniversalChart;
