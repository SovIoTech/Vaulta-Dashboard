import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';


const CircularGauge = ({ title, description, percentage, min, max, currentValue, percentageChange }) => {
  // Dynamic colors for percentage
  const gaugeColor = percentage > 70 ? '#28a745' : percentage > 40 ? '#ffc107' : '#dc3545';
  return (
    <div
      style={{
        width: '300px',
        height: '450px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '20px',
        margin: '20px',
        background: 'white',
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
      }}
    >
      <h3
        style={{
          fontSize: '22px',
          fontWeight: '600',
          color: '#333',
          textAlign: 'center',
          marginBottom: '10px',
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: '14px',
            color: '#555',
            textAlign: 'center',
            marginBottom: '15px',
          }}
        >
          {description}
        </p>
      )}

      <div
        style={{
          fontSize: '16px',
          color: 'green',
          textAlign: 'center',
        }}
        title="Minimum Value"
      >
        Min: {min}
      </div>

      <div
        style={{
          width: '100%',
          height: 250,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            pathColor: 'gray',
            textColor: '#333',
            textSize: '18px',
          })}
        />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          Delta
        </div>
        <div
          style={{
            fontSize: '14px',
            color: percentageChange > 0 ? '#28a745' : '#dc3545',
            fontWeight: '500',
          }}
          title="Percentage Change"
        >
          {percentageChange > 0 ? (
            <>
              <FaArrowUp style={{ color: '#28a745' }} /> {percentageChange.toFixed(2)}%
            </>
          ) : (
            <>
              <FaArrowDown style={{ color: '#dc3545' }} /> {Math.abs(percentageChange).toFixed(2)}%
            </>
          )}
        </div>
      </div>

      <div
        style={{
          fontSize: '16px',
          color: 'red',
          textAlign: 'center',
        }}
        title="Maximum Value"
      >
        Max: {max}
      </div>
    </div>
  );
};

export default CircularGauge;
