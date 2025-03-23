import React, { useEffect, useState } from "react";
import { FaSun, FaCloud, FaCloudRain, FaSnowflake } from "react-icons/fa";

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
        return <FaSun size={40} color="#ffc107" />;
      case "Clouds":
        return <FaCloud size={40} color="#6c757d" />;
      case "Rain":
        return <FaCloudRain size={40} color="#007bff" />;
      case "Snow":
        return <FaSnowflake size={40} color="#17a2b8" />;
      default:
        return <FaSun size={40} color="#ffc107" />;
    }
  };

  if (loading) {
    return <div>Loading weather data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      style={{
        width: "250px", // Fixed width for consistency
        height: "400px", // Fixed height for consistency
        border: "1px solid #e0e0e0", // CoreUI border color
        borderRadius: "8px", // CoreUI border radius
        padding: "20px",
        background: "#fff", // CoreUI background color
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)", // CoreUI shadow
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
      }}
    >
      {/* Weather Location */}
      <h3
        style={{
          fontSize: "1.25rem", // CoreUI font size
          fontWeight: "600", // CoreUI font weight
          color: "#3c4b64", // CoreUI primary text color
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
          fontSize: "1.5rem", // CoreUI font size
          fontWeight: "600", // CoreUI font weight
          color: "#3c4b64", // CoreUI primary text color
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        {weatherData?.main?.temp}°C
      </div>

      {/* Weather Description */}
      <div
        style={{
          fontSize: "1rem", // CoreUI font size
          color: "#6c757d", // CoreUI secondary text color
          textAlign: "center",
          marginBottom: "15px",
        }}
      >
        {weatherData?.weather[0]?.description}
      </div>

      {/* Additional Weather Details */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.9rem", // CoreUI font size
          color: "#6c757d", // CoreUI secondary text color
        }}
      >
        <div>
          <strong>Humidity:</strong> {weatherData?.main?.humidity}%
        </div>
        <div>
          <strong>Wind:</strong> {weatherData?.wind?.speed} m/s
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
