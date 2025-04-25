import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import styled from "@emotion/styled";

// Import a nice font (you'll need to include it in your project)
// Add this to your CSS file or index.html:
// @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

// Styled components for better organization
const GaugeContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
`;

const GaugeContent = styled(motion.div)`
  flex: 1;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const TextContainer = styled.div`
  flex: 1;
  padding-right: 20px;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: #333;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const InfoText = styled.div`
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(139, 195, 74, 0.1);
  border-radius: 6px;
  display: inline-block;
`;

const ValueDisplay = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 15px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const NavigationDots = styled.div`
  display: flex;
  justify-content: center;
  padding: 15px 0;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.active ? '#8BC34A' : '#e0e0e0'};
  transform: ${props => props.active ? 'scale(1.2)' : 'scale(1)'};
  
  &:hover {
    transform: scale(1.2);
    background-color: ${props => props.active ? '#8BC34A' : '#bdbdbd'};
  }
`;

const NavButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  margin: 0 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #8BC34A;
  font-weight: bold;
  font-size: 1.2rem;
  
  &:hover {
    transform: scale(1.1);
    background: #8BC34A;
    color: white;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const Gauges = ({ bmsState, roundValue }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % gauges.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const calculateColor = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage >= 90) return "#8BC34A";
    if (percentage >= 60) return "#FFC107";
    if (percentage >= 30) return "#FF9800";
    return "#dddddd";
  };

  const gauges = [
    {
      title: "Max Cell Temp",
      value: roundValue(bmsState.MaxCellTemp?.N || 0),
      info: `Node: ${bmsState.MaxCellTempNode?.N || "N/A"}`,
      min: 0,
      max: 100,
      unit: "°C",
      status: "Normal",
    },
    {
      title: "Max Cell Voltage",
      value: roundValue(bmsState.MaximumCellVoltage?.N || 0),
      info: `Cell: ${bmsState.MaximumCellVoltageCellNo?.N || "N/A"}, Node: ${
        bmsState.MaximumCellVoltageNode?.N || "N/A"
      }`,
      min: 0,
      max: 5,
      unit: "V",
      status: "Optimal",
    },
    {
      title: "Min Cell Temp",
      value: roundValue(bmsState.MinCellTemp?.N || 0),
      info: `Node: ${bmsState.MinCellTempNode?.N || "N/A"}`,
      min: 0,
      max: 100,
      unit: "°C",
      status: "Stable",
    },
    {
      title: "Min Cell Voltage",
      value: roundValue(bmsState.MinimumCellVoltage?.N || 0),
      info: `Cell: ${bmsState.MinimumCellVoltageCellNo?.N || "N/A"}, Node: ${
        bmsState.MinimumCellVoltageNode?.N || "N/A"
      }`,
      min: 0,
      max: 5,
      unit: "V",
      status: "Good",
    },
  ];

  const currentGauge = gauges[currentIndex];

  const prevGauge = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? gauges.length - 1 : prevIndex - 1
    );
  };
  
  const nextGauge = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % gauges.length
    );
  };

  return (
    <GaugeContainer>
      <AnimatePresence mode="wait">
        <GaugeContent
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
        >
          <TextContainer>
            <Title>{currentGauge.title}</Title>
            <InfoText>{currentGauge.info}</InfoText>
            <ValueDisplay>
              {currentGauge.value}
              <span style={{ fontSize: '1.5rem', marginLeft: '4px' }}>
                {currentGauge.unit}
              </span>
            </ValueDisplay>
            <div style={{
              padding: '6px 12px',
              backgroundColor: calculateColor(currentGauge.value, currentGauge.max) + '20',
              color: calculateColor(currentGauge.value, currentGauge.max),
              borderRadius: '20px',
              display: 'inline-block',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}>
              {currentGauge.status}
            </div>
          </TextContainer>
          
          <div style={{ width: "180px", height: "180px" }}>
            <CircularProgressbar
              value={(currentGauge.value / currentGauge.max) * 100}
              text={`${currentGauge.value}${currentGauge.unit}`}
              styles={buildStyles({
                textSize: '28px',
                pathColor: calculateColor(currentGauge.value, currentGauge.max),
                textColor: "#2c3e50",
                trailColor: "#f5f5f5",
                pathTransitionDuration: 1,
                text: {
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif',
                },
              })}
            />
          </div>
        </GaugeContent>
      </AnimatePresence>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingBottom: '15px'
      }}>
        <NavButton onClick={prevGauge}>←</NavButton>
        
        <NavigationDots>
          {gauges.map((_, index) => (
            <Dot
              key={index}
              active={currentIndex === index}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </NavigationDots>
        
        <NavButton onClick={nextGauge}>→</NavButton>
      </div>
    </GaugeContainer>
  );
};

export default Gauges;