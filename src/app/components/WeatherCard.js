import React, { useEffect, useState } from "react";
import {
  FaSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaBolt,
} from "react-icons/fa";

const WeatherCard = ({ city = "Sydney" }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch weather data from OpenWeatherMap API
  useEffect(() => {
    const apiKey = "e56fb560ded28bd88a332ffe3594edaf";
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.cod === 200) {
          setWeatherData(data);
        } else {
          setError(data.message || "Failed to fetch weather data.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching weather data:", err); // Debugging
        setError("Failed to fetch weather data.");
        setLoading(false);
      });
  }, [city]);

  // Render weather icon based on weather condition
  const renderWeatherIcon = (weatherCondition) => {
    switch (weatherCondition) {
      case "Clear":
        return <FaSun size={48} color="#FFC107" />;
      case "Clouds":
        return <FaCloud size={48} color="#757575" />;
      case "Rain":
      case "Drizzle":
        return <FaCloudRain size={48} color="#1259c3" />;
      case "Snow":
        return <FaSnowflake size={48} color="#00BCD4" />;
      case "Thunderstorm":
        return <FaBolt size={48} color="#F44336" />;
      default:
        return <FaCloud size={48} color="#757575" />;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          width: "275px",
          height: "400px",
          border: "1px solid #e6e6e6",
          borderRadius: "15px", // Rounded corners for OneUI
          padding: "20px",
          background: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#757575",
        }}
      >
        Loading weather data...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: "275px",
          height: "400px",
          border: "1px solid #e6e6e6",
          borderRadius: "15px", // Rounded corners for OneUI
          padding: "20px",
          background: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#F44336",
        }}
      >
        Error: {error}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "275px", // Fixed width for consistency
        height: "400px", // Fixed height for consistency
        border: "1px solid #e6e6e6", // Light border
        borderRadius: "15px", // Rounded corners for OneUI
        padding: "20px",
        background: "#fff", // White background
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)", // OneUI shadow
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
      }}
    >
      {/* Weather Location */}
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: "600",
          color: "#1259c3", // OneUI blue
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        Weather in {city}
      </h3>

      {/* Weather Icon */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        {renderWeatherIcon(weatherData?.weather[0]?.main)}
      </div>

      {/* Temperature */}
      <div
        style={{
          fontSize: "2rem",
          fontWeight: "600",
          color: "#000000", // OneUI text color
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        {weatherData?.main?.temp}°C
      </div>

      {/* Weather Description */}
      <div
        style={{
          fontSize: "1rem",
          color: "#757575", // Gray text
          textAlign: "center",
          marginBottom: "20px",
          textTransform: "capitalize",
        }}
      >
        {weatherData?.weather[0]?.description}
      </div>

      {/* Additional Weather Details */}
      <div
        style={{
          borderTop: "1px solid #e6e6e6",
          paddingTop: "15px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.9rem",
            color: "#000000", // OneUI text color
            marginBottom: "10px",
          }}
        >
          <div>Humidity:</div>
          <div style={{ fontWeight: "600" }}>
            {weatherData?.main?.humidity}%
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.9rem",
            color: "#000000", // OneUI text color
            marginBottom: "10px",
          }}
        >
          <div>Wind:</div>
          <div style={{ fontWeight: "600" }}>
            {weatherData?.wind?.speed} m/s
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.9rem",
            color: "#000000", // OneUI text color
          }}
        >
          <div>Pressure:</div>
          <div style={{ fontWeight: "600" }}>
            {weatherData?.main?.pressure} hPa
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
