import React, { useEffect, useState } from "react";
import {
  FaSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaBolt,
  FaTint,
  FaUmbrella,
  FaTemperatureHigh,
  FaTemperatureLow,
} from "react-icons/fa";

const WeatherCard = ({ city = "Brisbane" }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current weather and forecast data
  useEffect(() => {
    const apiKey = "e56fb560ded28bd88a332ffe3594edaf";
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    Promise.all([
      fetch(currentWeatherUrl).then(res => res.json()),
      fetch(forecastUrl).then(res => res.json())
    ])
      .then(([currentData, forecastData]) => {
        if (currentData.cod === 200 && forecastData.cod === "200") {
          setWeatherData(currentData);
          setForecastData(forecastData);
        } else {
          setError(currentData.message || forecastData.message || "Failed to fetch weather data.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching weather data:", err);
        setError("Failed to fetch weather data.");
        setLoading(false);
      });
  }, [city]);

  // Get min/max temps for last/next 24 hours from forecast data
  const get24HourTemps = () => {
    if (!forecastData) return { last24: {}, next24: {} };
    
    const now = new Date();
    const last24 = [];
    const next24 = [];
    
    forecastData.list.forEach(item => {
      const itemDate = new Date(item.dt * 1000);
      const hoursDiff = (now - itemDate) / (1000 * 60 * 60);
      
      if (hoursDiff <= 24 && hoursDiff >= 0) {
        last24.push(item.main.temp);
      } else if (hoursDiff >= -24 && hoursDiff < 0) {
        next24.push(item.main.temp);
      }
    });
    
    return {
      last24: {
        min: Math.min(...last24),
        max: Math.max(...last24),
        avg: last24.reduce((a, b) => a + b, 0) / last24.length
      },
      next24: {
        min: Math.min(...next24),
        max: Math.max(...next24),
        avg: next24.reduce((a, b) => a + b, 0) / next24.length
      }
    };
  };

  // Get rain forecast
  const getRainForecast = () => {
    if (!forecastData) return { last24: 0, next24: 0 };
    
    let last24Rain = 0;
    let next24Rain = 0;
    
    forecastData.list.forEach(item => {
      const itemDate = new Date(item.dt * 1000);
      const hoursDiff = (new Date() - itemDate) / (1000 * 60 * 60);
      
      if (item.rain && item.rain["3h"]) {
        if (hoursDiff <= 24 && hoursDiff >= 0) {
          last24Rain += item.rain["3h"];
        } else if (hoursDiff >= -24 && hoursDiff < 0) {
          next24Rain += item.rain["3h"];
        }
      }
    });
    
    return { last24: last24Rain, next24: next24Rain };
  };

  const renderWeatherIcon = (weatherCondition) => {
    switch (weatherCondition) {
      case "Clear": return <FaSun size={48} color="#FFC107" />;
      case "Clouds": return <FaCloud size={48} color="#757575" />;
      case "Rain": case "Drizzle": return <FaCloudRain size={48} color="#1259c3" />;
      case "Snow": return <FaSnowflake size={48} color="#00BCD4" />;
      case "Thunderstorm": return <FaBolt size={48} color="#F44336" />;
      default: return <FaCloud size={48} color="#757575" />;
    }
  };

  if (loading) {
    return <div className="weather-card">Loading weather data...</div>;
  }

  if (error) {
    return <div className="weather-card error">Error: {error}</div>;
  }

  const temps = get24HourTemps();
  const rain = getRainForecast();

  return (
    <div className="weather-card expanded">
      <h3>Weather in {city}</h3>
      
      <div className="weather-icon">
        {renderWeatherIcon(weatherData?.weather[0]?.main)}
        <div className="current-temp">{weatherData?.main?.temp}°C</div>
        <div className="weather-desc">{weatherData?.weather[0]?.description}</div>
      </div>
      
      <div className="weather-details-grid">
        {/* Temperature Section */}
        <div className="detail-section">
          <h4><FaTemperatureHigh /> Temperatures</h4>
          <div className="temp-row">
            <span>Last 24h:</span>
            <span>{temps.last24.min.toFixed(1)}° / {temps.last24.max.toFixed(1)}°</span>
          </div>
          <div className="temp-row">
            <span>Next 24h:</span>
            <span>{temps.next24.min.toFixed(1)}° / {temps.next24.max.toFixed(1)}°</span>
          </div>
        </div>
        
        {/* Rain Section */}
        <div className="detail-section">
          <h4><FaUmbrella /> Precipitation</h4>
          <div className="rain-row">
            <span>Last 24h:</span>
            <span>{rain.last24.toFixed(1)} mm</span>
          </div>
          <div className="rain-row">
            <span>Next 24h:</span>
            <span>{rain.next24.toFixed(1)} mm</span>
          </div>
        </div>
        
        {/* Humidity Section */}
        <div className="detail-section">
          <h4><FaTint /> Humidity</h4>
          <div className="humidity-row">
            <span>Current:</span>
            <span>{weatherData?.main?.humidity}%</span>
          </div>
          <div className="humidity-row">
            <span>Wind:</span>
            <span>{weatherData?.wind?.speed} m/s</span>
          </div>
        </div>
        
        {/* Pressure Section */}
        <div className="detail-section">
          <h4>Pressure</h4>
          <div className="pressure-row">
            <span>Current:</span>
            <span>{weatherData?.main?.pressure} hPa</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .weather-card {
          width: 100%;
          height: 100%;
          border: 1px solid #e6e6e6;
          border-radius: 15px;
          padding: 20px;
          background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }
        
        .weather-card.expanded {
          min-height: 500px;
        }
        
        .weather-card.error {
          color: #F44336;
          justify-content: center;
          align-items: center;
        }
        
        h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1259c3;
          text-align: center;
          margin-bottom: 15px;
        }
        
        .weather-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .current-temp {
          font-size: 2rem;
          font-weight: 600;
          margin: 10px 0;
        }
        
        .weather-desc {
          font-size: 1rem;
          color: #757575;
          text-transform: capitalize;
        }
        
        .weather-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 15px;
        }
        
        .detail-section {
          border-top: 1px solid #e6e6e6;
          padding-top: 10px;
        }
        
        .detail-section h4 {
          font-size: 0.9rem;
          color: #1259c3;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .temp-row, .rain-row, .humidity-row, .pressure-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

export default WeatherCard;