import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WeatherCard = ({ city, containerRef }) => {
  // Enhanced color scheme
  const colors = {
    primary: '#818181',       // Base gray
    secondary: '#c0c0c0',     // Light gray
    accentGreen: '#4CAF50',   // Vibrant green
    accentRed: '#F44336',     // Strategic red
    accentBlue: '#2196F3',    // Complementary blue
    background: 'rgba(192, 192, 192, 0.1)',
    textDark: '#333333',
    textLight: '#555555',
    highlight: '#FFC107'      // Accent yellow
  };

  // Sample weather data with dynamic conditions
  const weatherData = {
    current: {
      temp: 28,
      condition: "Sunny",
      humidity: 65,
      windSpeed: 12,
      icon: "☀️",
      alert: false
    },
    forecast: [
      { hour: "6AM", temp: 22, precip: 0 },
      { hour: "9AM", temp: 25, precip: 0 },
      { hour: "12PM", temp: 28, precip: 0 },
      { hour: "3PM", temp: 30, precip: 5 },
      { hour: "6PM", temp: 27, precip: 15 },
      { hour: "9PM", temp: 24, precip: 10 },
      { hour: "12AM", temp: 22, precip: 5 },
    ]
  };

  // Temperature chart data with dynamic coloring
  const tempChartData = {
    labels: weatherData.forecast.map(item => item.hour),
    datasets: [
      {
        label: "Temperature (°C)",
        data: weatherData.forecast.map(item => item.temp),
        borderColor: colors.primary,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(55, 58, 55, 0.3)');  // Green
          gradient.addColorStop(0.5, 'rgba(156, 154, 148, 0.3)'); // Yellow
          gradient.addColorStop(1, 'rgba(220, 212, 211, 0.3)');  // Red
          return gradient;
        },
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: (context) => {
          const value = context.dataset.data[context.dataIndex];
          return colors.primary;
        },
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  // Precipitation chart data with enhanced visuals
  const precipChartData = {
    labels: weatherData.forecast.map(item => item.hour),
    datasets: [
      {
        label: "Precipitation (%)",
        data: weatherData.forecast.map(item => item.precip),
        backgroundColor: (context) => {
          const value = context.dataset.data[context.dataIndex];
          return colors.secondary;
          
        },
        borderColor: colors.primary,
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: colors.primary
      }
    ]
  };

  // Enhanced chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: colors.textDark,
        titleFont: {
          size: 14,
          weight: "bold"
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: colors.textLight,
          font: {
            weight: '500'
          }
        }
      },
      y: {
        grid: {
          color: colors.background,
          drawBorder: false
        },
        ticks: {
          color: colors.textLight,
          font: {
            weight: '500'
          }
        }
      }
    }
  };

  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      border: `1px solid ${colors.primary}`,
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        boxShadow: "0 6px 16px rgba(0,0,0,0.15)"
      }
    }}>
      {/* Alert badge if needed */}
      {weatherData.current.alert && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: colors.accentRed,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.7rem',
          fontWeight: 'bold'
        }}>
          ALERT
        </div>
      )}

      {/* Current Weather Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        borderBottom: `1px solid ${colors.secondary}`,
        paddingBottom: "15px"
      }}>
        <div>
          <h2 style={{
            fontSize: "1.3rem",
            fontWeight: "700",
            color: colors.textDark,
            margin: 0,
            letterSpacing: "0.5px",
            display: 'flex',
            alignItems: 'center'
          }}>
            {/* <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              backgroundColor: colors.accentGreen,
              borderRadius: '50%',
              marginRight: '8px'
            }}></span> */}
            {city} Weather
          </h2>
          <p style={{
            fontSize: "0.95rem",
            color: colors.textLight,
            margin: "8px 0 0 0",
            display: 'flex',
            alignItems: 'center'
          }}>
            {/* <span style={{ 
              marginRight: '6px',
              color: colors.accentGreen
            }}>⬤</span> */}
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center"
        }}>
          <span style={{
            fontSize: "2.8rem",
            marginRight: "12px",
            color: colors.highlight
          }}>
            {weatherData.current.icon}
          </span>
          <div>
            <span style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: colors.textDark,
              // background: `linear-gradient(135deg, ${colors.accentGreen}, ${colors.accentBlue})`,
              // WebkitBackgroundClip: 'text',
              // WebkitTextFillColor: 'transparent'
            }}>
              {weatherData.current.temp}°C
            </span>
            <p style={{
              fontSize: "0.95rem",
              color: colors.textLight,
              margin: 0,
              textAlign: "right",
              fontWeight: '500'
            }}>
              {weatherData.current.condition}
            </p>
          </div>
        </div>
      </div>

      {/* Weather Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "15px",
        marginBottom: "20px"
      }}>
        <div style={{
          backgroundColor: colors.background,
          borderRadius: "10px",
          padding: "14px",
          textAlign: "center",
          border: `1px solid ${colors.secondary}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 8px ${colors.secondary}`
          }
        }}>
          <p style={{
            fontSize: "0.85rem",
            color: colors.textLight,
            margin: "0 0 8px 0",
            fontWeight: "600",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              backgroundColor: colors.accentGreen,
              borderRadius: '50%',
              marginRight: '6px'
            }}></span> */}
            Humidity
          </p>
          <p style={{
            fontSize: "1.4rem",
            fontWeight: "700",
            color: colors.textLight,
            margin: 0,
            textShadow: `0 2px 4px ${colors.secondary}`
          }}>
            {weatherData.current.humidity}%
          </p>
        </div>
        <div style={{
          backgroundColor: colors.background,
          borderRadius: "10px",
          padding: "14px",
          textAlign: "center",
          border: `1px solid ${colors.secondary}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 8px ${colors.secondary}`
          }
        }}>
          <p style={{
            fontSize: "0.85rem",
            color: colors.textLight,
            margin: "0 0 8px 0",
            fontWeight: "600",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              backgroundColor: colors.secondary,
              borderRadius: '50%',
              marginRight: '6px'
            }}></span> */}
            Wind Speed
          </p>
          <p style={{
            fontSize: "1.4rem",
            fontWeight: "700",
            color: colors.textLight,
            margin: 0,
            textShadow: `0 2px 4px ${colors.secondary}`
          }}>
            {weatherData.current.windSpeed} km/h
          </p>
        </div>
      </div>

      {/* Temperature Chart */}
      <div style={{
        flex: 1,
        marginBottom: "20px",
        minHeight: "180px"  // Increased height
      }}>
        <h3 style={{
          fontSize: "1rem",
          fontWeight: "700",
          color: colors.textDark,
          margin: "0 0 12px 0",
          display: "flex",
          alignItems: "center"
        }}>
          <span style={{
            display: "inline-block",
            width: "14px",
            height: "14px",
            backgroundColor: colors.primary,
            marginRight: "10px",
            borderRadius: "3px"
          }}></span>
          Temperature Forecast
        </h3>
        <div style={{ 
          height: "calc(100% - 30px)",
          padding: "8px",
          borderRadius: '8px',
          backgroundColor: 'rgba(255,255,255,0.7)',
          border: `1px solid ${colors.secondary}`
        }}>
          <Line data={tempChartData} options={chartOptions} />
        </div>
      </div>

      {/* Precipitation Chart */}
      <div style={{
        flex: 1,
        minHeight: "180px"  // Increased height
      }}>
        <h3 style={{
          fontSize: "1rem",
          fontWeight: "700",
          color: colors.textDark,
          margin: "0 0 12px 0",
          display: "flex",
          alignItems: "center"
        }}>
          <span style={{
            display: "inline-block",
            width: "14px",
            height: "14px",
            backgroundColor: colors.primary,
            marginRight: "10px",
            borderRadius: "3px"
          }}></span>
          Precipitation Probability
        </h3>
        <div style={{ 
          height: "calc(100% - 30px)",
          padding: "8px",
          borderRadius: '8px',
          backgroundColor: 'rgba(255,255,255,0.7)',
          border: `1px solid ${colors.secondary}`
        }}>
          <Bar data={precipChartData} options={{
            ...chartOptions,
            scales: {
              ...chartOptions.scales,
              y: {
                ...chartOptions.scales.y,
                max: 100,
                min: 0
              }
            }
          }} />
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;