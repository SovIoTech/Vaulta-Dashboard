import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f"];

// Component to visualize battery health data
const BatteryHealthVisualization = ({ data }) => {
  if (!data || !data.processedData) return <p>No data available for visualization</p>;

  const { voltageStats, currentStats, temperatureStats, socHistory } = data.processedData;

  // Prepare SOC history data for chart
  const socChartData = socHistory.map(dataPoint => ({
    timestamp: new Date(dataPoint.timestamp * 1000).toLocaleDateString(),
    soc: dataPoint.value
  })).slice(-30); // Show last 30 data points for clarity

  // Prepare stats data for bar chart
  const statsData = [
    { name: "Voltage Min", value: voltageStats.min, fill: "#8884d8" },
    { name: "Voltage Avg", value: voltageStats.avg, fill: "#8884d8" },
    { name: "Voltage Max", value: voltageStats.max, fill: "#8884d8" },
    { name: "Current Min", value: currentStats.min, fill: "#82ca9d" },
    { name: "Current Avg", value: currentStats.avg, fill: "#82ca9d" },
    { name: "Current Max", value: currentStats.max, fill: "#82ca9d" },
    { name: "Temp Min", value: temperatureStats.min, fill: "#ffc658" },
    { name: "Temp Avg", value: temperatureStats.avg, fill: "#ffc658" },
    { name: "Temp Max", value: temperatureStats.max, fill: "#ffc658" },
  ];

  return (
    <div style={{ padding: "15px" }}>
      <h3 style={{ marginBottom: "15px", fontWeight: "500" }}>Battery Health Analysis</h3>
      
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Key Metrics</h4>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "15px", 
          justifyContent: "space-between" 
        }}>
          <div style={{ 
            backgroundColor: "#f0f4ff", 
            padding: "15px", 
            borderRadius: "8px",
            flex: "1 1 200px",
            minWidth: "200px" 
          }}>
            <div style={{ fontSize: "14px", color: "#666" }}>Battery Age</div>
            <div style={{ fontSize: "24px", fontWeight: "600", marginTop: "5px" }}>
              {data.processedData.estimatedAge} days
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: "#f0fff4", 
            padding: "15px", 
            borderRadius: "8px",
            flex: "1 1 200px",
            minWidth: "200px" 
          }}>
            <div style={{ fontSize: "14px", color: "#666" }}>Cycle Count</div>
            <div style={{ fontSize: "24px", fontWeight: "600", marginTop: "5px" }}>
              {data.processedData.cycleCount}
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: "#fff8f0", 
            padding: "15px", 
            borderRadius: "8px",
            flex: "1 1 200px",
            minWidth: "200px" 
          }}>
            <div style={{ fontSize: "14px", color: "#666" }}>Voltage Variation</div>
            <div style={{ fontSize: "24px", fontWeight: "600", marginTop: "5px" }}>
              {voltageStats.stdDev.toFixed(3)} V
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: "30px" }}>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>State of Charge History</h4>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={socChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="soc" stroke="#8884d8" name="SOC %" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Battery Parameter Statistics</h4>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Component to visualize predictive maintenance data
const PredictiveMaintenanceVisualization = ({ data }) => {
  if (!data || !data.processedData) return <p>No data available for visualization</p>;

  const { statisticalPatterns, cycleInformation, temperatureExtremes, chargingEfficiency } = data.processedData;

  // Prepare voltage and current trend data
  const voltageTrend = statisticalPatterns.voltage.trend.map(point => ({
    timestamp: new Date(point.timestamp * 1000).toLocaleString(),
    voltage: point.value
  })).slice(-30);  // Last 30 points for clarity

  const currentTrend = statisticalPatterns.current.trend.map(point => ({
    timestamp: new Date(point.timestamp * 1000).toLocaleString(),
    current: point.value
  })).slice(-30);  // Last 30 points for clarity

  // Prepare temperature fluctuations data
  const tempFluctuations = temperatureExtremes.fluctuations.map(point => ({
    timestamp: new Date(point.timestamp * 1000).toLocaleString(),
    change: point.change
  })).slice(-30);  // Last 30 points for clarity

  // Prepare charge/discharge cycle data
  const cycleData = [];
  
  cycleInformation.chargeDurations.forEach((charge, index) => {
    if (index < 10) {  // Only show the last 10 cycles for clarity
      cycleData.push({
        cycle: cycleInformation.chargeDurations.length - index,
        chargeDuration: charge.duration / 3600,  // Convert to hours
        dischargeDuration: index < cycleInformation.dischargeDurations.length ? 
          cycleInformation.dischargeDurations[index].duration / 3600 : 0
      });
    }
  });
  
  cycleData.reverse();  // Show most recent cycles last

  // Prepare DoD (Depth of Discharge) data for pie chart
  const dodData = [
    { name: "0-20%", value: 0 },
    { name: "20-40%", value: 0 },
    { name: "40-60%", value: 0 },
    { name: "60-80%", value: 0 },
    { name: "80-100%", value: 0 }
  ];
  
  cycleInformation.depthOfDischarge.forEach(cycle => {
    const depth = cycle.depth;
    if (depth <= 20) dodData[0].value++;
    else if (depth <= 40) dodData[1].value++;
    else if (depth <= 60) dodData[2].value++;
    else if (depth <= 80) dodData[3].value++;
    else dodData[4].value++;
  });

  return (
    <div style={{ padding: "15px" }}>
      <h3 style={{ marginBottom: "15px", fontWeight: "500" }}>Predictive Maintenance Analysis</h3>
      
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Key Metrics</h4>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "15px", 
          justifyContent: "space-between" 
        }}>
          <div style={{ 
            backgroundColor: "#f0f4ff", 
            padding: "15px", 
            borderRadius: "8px",
            flex: "1 1 200px",
            minWidth: "200px" 
          }}>
            <div style={{ fontSize: "14px", color: "#666" }}>Total Cycles</div>
            <div style={{ fontSize: "24px", fontWeight: "600", marginTop: "5px" }}>
              {cycleInformation.count}
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: "#f0fff4", 
            padding: "15px", 
            borderRadius: "8px",
            flex: "1 1 200px",
            minWidth: "200px" 
          }}>
            <div style={{ fontSize: "14px", color: "#666" }}>Temperature Range</div>
            <div style={{ fontSize: "18px", fontWeight: "600", marginTop: "5px" }}>
              {temperatureExtremes.min.toFixed(1)} - {temperatureExtremes.max.toFixed(1)} °C
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: "#fff8f0", 
            padding: "15px", 
            borderRadius: "8px",
            flex: "1 1 200px",
            minWidth: "200px" 
          }}>
            <div style={{ fontSize: "14px", color: "#666" }}>Voltage Stability</div>
            <div style={{ fontSize: "18px", fontWeight: "600", marginTop: "5px" }}>
              ±{statisticalPatterns.voltage.stdDev.toFixed(3)} V
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: "30px" }}>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Voltage Trend Analysis</h4>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={voltageTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="voltage" stroke="#8884d8" name="Voltage (V)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div style={{ marginBottom: "30px" }}>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Charge/Discharge Cycle Analysis</h4>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cycleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cycle" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="chargeDuration" name="Charge Duration (h)" fill="#82ca9d" />
              <Bar dataKey="dischargeDuration" name="Discharge Duration (h)" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ flex: "1 1 400px", minHeight: "300px" }}>
          <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Temperature Fluctuations</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tempFluctuations} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="change" name="Temperature Change (°C)" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ flex: "1 1 400px", minHeight: "300px" }}>
          <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Depth of Discharge Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {dodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value + " cycles"} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Main ML Data Visualization component that displays the appropriate visualization based on task type
const MLDataVisualization = ({ data, taskType }) => {
  // If no data is available, show a message
  if (!data) {
    return (
      <div style={{ 
        padding: "30px", 
        textAlign: "center",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        color: "#666"
      }}>
        No data available for visualization. Please collect data first.
      </div>
    );
  }

  // Render the appropriate visualization based on task type
  switch (taskType) {
    case "batteryHealth":
      return <BatteryHealthVisualization data={data} />;
    case "anomalyDetection":
      return <AnomalyDetectionVisualization data={data} />;
    case "energyOptimization":
      return <EnergyOptimizationVisualization data={data} />;
    case "predictiveMaintenance":
      return <PredictiveMaintenanceVisualization data={data} />;
    default:
      return (
        <div style={{ 
          padding: "30px", 
          textAlign: "center",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          color: "#666"
        }}>
          Please select a data type to visualize.
        </div>
      );
  }
};

export default MLDataVisualization;

// Component to visualize anomaly detection data
const AnomalyDetectionVisualization = ({ data }) => {
  if (!data || !data.processedData) return <p>No data available for visualization</p>;

  const { recentReadings, internalResistanceValues, normalOperationBounds } = data.processedData;

  // Prepare recent readings data for chart
  const recentReadingsData = recentReadings.map(reading => ({
    timestamp: new Date(reading.timestamp * 1000).toLocaleTimeString(),
    voltage: reading.voltage,
    current: reading.current,
    temperature: reading.temperature
  })).slice(-20); // Show last 20 readings for clarity

  // Prepare internal resistance data
  const resistanceData = internalResistanceValues
    .slice(-20) // Last 20 points
    .map(point => ({
      timestamp: new Date(point.timestamp * 1000).toLocaleTimeString(),
      resistance: point.value
    }));

  return (
    <div style={{ padding: "15px" }}>
      <h3 style={{ marginBottom: "15px", fontWeight: "500" }}>Anomaly Detection Analysis</h3>
      
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Normal Operation Bounds</h4>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "15px", 
          justifyContent: "space-between" 
        }}>
          <div style={{ 
            backgroundColor: "#f0f4ff", 
            padding: "15px", 
            borderRadius: "8px",
            flex: "1 1 200px",
            minWidth: "200px" 
          }}>
            <div style={{ fontSize: "14px", color: "#666" }}>Voltage Range</div>
            <div style={{ fontSize: "18px", fontWeight: "600", marginTop: "5px" }}>
              {normalOperationBounds.voltage.min.toFixed(2)} - {normalOperationBounds.voltage.max.toFixed(2)} V
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: "#f0fff4", 
            padding: "15px", 
            borderRadius: "8px",
            flex: "1 1 200px",
            minWidth: "200px" 
          }}>
            <div style={{ fontSize: "14px", color: "#666" }}>Current Range</div>
            <div style={{ fontSize: "18px", fontWeight: "600", marginTop: "5px" }}>
              {normalOperationBounds.current.min.toFixed(2)} - {normalOperationBounds.current.max.toFixed(2)} A
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: "#fff8f0", 
            padding: "15px", 
            borderRadius: "8px",
            flex: "1 1 200px",
            minWidth: "200px" 
          }}>
            <div style={{ fontSize: "14px", color: "#666" }}>Temperature Range</div>
            <div style={{ fontSize: "18px", fontWeight: "600", marginTop: "5px" }}>
              {normalOperationBounds.temperature.min.toFixed(2)} - {normalOperationBounds.temperature.max.toFixed(2)} °C
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: "30px" }}>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Recent Parameter Readings</h4>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentReadingsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="voltage" stroke="#8884d8" name="Voltage (V)" />
              <Line type="monotone" dataKey="current" stroke="#82ca9d" name="Current (A)" />
              <Line type="monotone" dataKey="temperature" stroke="#ffc658" name="Temperature (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Internal Resistance Variation</h4>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={resistanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="resistance" stroke="#8884d8" name="Resistance (Ohm)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Component to visualize energy optimization data
const EnergyOptimizationVisualization = ({ data }) => {
  if (!data || !data.processedData) return <p>No data available for visualization</p>;

  const { usagePatterns, environmentalFactors, chargingPatterns, timeSeriesData } = data.processedData;

  // Prepare hourly usage data for the chart
  const hourlyData = usagePatterns.hourly.map((value, index) => ({
    hour: index,
    usage: value
  }));

  // Prepare daily usage data for the chart
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dailyData = usagePatterns.daily.map((value, index) => ({
    day: daysOfWeek[index],
    usage: value
  }));

  // Prepare environmental factors data
  const tempData = environmentalFactors
    .slice(-48) // Last 48 readings for clarity
    .map((factor, index) => ({
      point: index,
      timestamp: new Date(factor.timestamp * 1000).toLocaleTimeString(),
      temperature: factor.temperature
    }));

  // Prepare charging patterns data
  const chargingData = chargingPatterns.map((pattern, index) => {
    const startDate = new Date(pattern.startTime * 1000);
    const hourOfDay = startDate.getHours();
    const dayOfWeek = startDate.getDay();
    const duration = pattern.duration / 3600; // Convert seconds to hours
    
    return {
      id: index,
      startTime: startDate.toLocaleString(),
      hourOfDay,
      dayOfWeek: daysOfWeek[dayOfWeek],
      duration
    };
  });

  // Aggregate charging by hour of day for visualization
  const chargingByHour = Array(24).fill(0);
  chargingPatterns.forEach(pattern => {
    const hour = new Date(pattern.startTime * 1000).getHours();
    chargingByHour[hour] += pattern.duration / 3600; // Add duration in hours
  });
  
  const chargingHourData = chargingByHour.map((value, index) => ({
    hour: index,
    duration: value
  }));

  return (
    <div style={{ padding: "15px" }}>
      <h3 style={{ marginBottom: "15px", fontWeight: "500" }}>Energy Optimization Analysis</h3>
      
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Power Usage by Hour of Day</h4>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Relative Usage', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => (value * 100).toFixed(2) + '%'} />
              <Legend />
              <Bar dataKey="usage" name="Power Usage %" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div style={{ marginBottom: "30px" }}>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Power Usage by Day of Week</h4>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Relative Usage', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => (value * 100).toFixed(2) + '%'} />
              <Legend />
              <Bar dataKey="usage" name="Power Usage %" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div style={{ marginBottom: "30px" }}>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Temperature Correlation</h4>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tempData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#ffc658" name="Temperature (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h4 style={{ marginBottom: "10px", fontWeight: "500" }}>Charging Patterns by Hour</h4>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chargingHourData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Total Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="duration" name="Charging Duration (hours)" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};