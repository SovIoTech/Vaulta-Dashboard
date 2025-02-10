import { useState, useEffect } from "react";

const DataSource = () => {
  const [percentage1, setPercentage1] = useState(0);
  const [percentage2, setPercentage2] = useState(0);
  const [percentage3, setPercentage3] = useState(0);
  const [percentage4, setPercentage4] = useState(0);
  const [percentage5, setPercentage5] = useState(0);
  const [percentage6, setPercentage6] = useState(0);
  const [percentage7, setPercentage7] = useState(0);

  const [currentValue1, setCurrentValue1] = useState(0);
  const [currentValue2, setCurrentValue2] = useState(0);
  const [currentValue3, setCurrentValue3] = useState(0);
  const [currentValue4, setCurrentValue4] = useState(0);
  const [currentValue5, setCurrentValue5] = useState(0);
  const [currentValue6, setCurrentValue6] = useState(0);
  const [currentValue7, setCurrentValue7] = useState(0);
  
    const [history1, setHistory1] = useState([]);
    const [history2, setHistory2] = useState([]);
    const [history3, setHistory3] = useState([]);
    const [history4, setHistory4] = useState([]);
    const [history5, setHistory5] = useState([]);
    const [history6, setHistory6] = useState([]);
    const [history7, setHistory7] = useState([]);
    const [hourlyData, setHourlyData] = useState([]);

    const calculatePercentageChange = (prev, current) => {
      if (prev === 0) return 0;
      return ((current - prev) / prev) * 100;
    };
  
  useEffect(() => {
    const interval = setInterval(() => {
        const newPercentage1 = Math.floor(Math.random() * 100) + 1;
        const newPercentage2 = Math.floor(Math.random() * 100) + 1;
        const newPercentage3 = Math.floor(Math.random() * 100) + 1;
        const newPercentage4 = Math.floor(Math.random() * 100) + 1;
        const newPercentage5 = Math.floor(Math.random() * 100) + 1;
        const newPercentage6 = Math.floor(Math.random() * 100) + 1;
        const newPercentage7 = Math.floor(Math.random() * 100) + 1;
  
        setHistory1((prev) => [...prev, newPercentage1].slice(-10));
        setHistory2((prev) => [...prev, newPercentage2].slice(-10));
        setHistory3((prev) => [...prev, newPercentage3].slice(-10));
        setHistory4((prev) => [...prev, newPercentage4].slice(-10));
        setHistory5((prev) => [...prev, newPercentage5].slice(-10));
        setHistory6((prev) => [...prev, newPercentage6].slice(-10));
        setHistory7((prev) => [...prev, newPercentage7].slice(-10));
  
        setPercentage1(newPercentage1);
        setPercentage2(newPercentage2);
        setPercentage3(newPercentage3);
        setPercentage4(newPercentage4);
        setPercentage5(newPercentage5);
        setPercentage6(newPercentage6);
        setPercentage7(newPercentage7);
  
        setCurrentValue1(newPercentage1);
        setCurrentValue2(newPercentage2);
        setCurrentValue3(newPercentage3);
        setCurrentValue4(newPercentage4);
        setCurrentValue5(newPercentage5);
        setCurrentValue6(newPercentage6);
        setCurrentValue7(newPercentage7);
      }, 4000);

    
  
      const dummyData = Array.from({ length: 48 }, (_, i) => ({
        hour: i < 24 ? `-${24 - i}h` : `+${i - 23}h`,
        temperature: Math.floor(Math.random() * 15) + 10,
        rain: Math.random() < 0.5 ? 0 : Math.random() * 10,
        humidity: Math.floor(Math.random() * 50) + 50,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        pressure: Math.floor(Math.random() * 10) + 1015,
      }));
      setHourlyData(dummyData);
  
      return () => clearInterval(interval);
    }, []);
  

    const pieData = [
        { name: 'Money Saved', value: 50 },
        { name: 'Collectively', value: 30 },
        { name: 'All Time', value: 10 },
        { name: 'This Month', value: 10 },
      ];
    
    
      const pieData1 = [
        { name: 'Abated', value: 36000},
        { name: 'Created', value: 24000 },
        { name: 'OffSet', value: 12000 }
      
      ];

    return {
      percentage1,
      percentage2,
      percentage3,
      percentage4,
      percentage5,
      percentage6,
      percentage7,
      currentValue1,
      currentValue2,
      currentValue3,
      currentValue4,
      currentValue5,
      currentValue6,
      currentValue7,
      history1,
      history2,
      history3,
      history4,
      history5,
      history6,
      history7,
      hourlyData,
      pieData, // ✅ Make sure this is included
      pieData1, // ✅ Make sure this is included
      calculatePercentageChange,
    };
  };
  
  export default DataSource;