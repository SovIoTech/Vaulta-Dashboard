// import React from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   LineChart,
//   Line,
// } from "recharts";

// const PackDataViewer = ({ packData }) => {
//   if (!packData) {
//     return <p>No pack data available.</p>;
//   }

//   // Transform Pack data for the graph
//   const packGraphData = Object.keys(packData).map((key) => ({
//     name: key,
//     value: packData[key], // Assuming each key has a corresponding value
//   }));

//   // If the data is time-series (e.g., an array of objects), render a line chart
//   const isTimeSeries = Array.isArray(packData);

//   return (
//     <div>
//       <h2>Pack Data</h2>

//       {isTimeSeries ? (
//         // Render a LineChart for time-series data
//         <LineChart width={600} height={300} data={packData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="time" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Line type="monotone" dataKey="value" stroke="#8884d8" />
//         </LineChart>
//       ) : (
//         // Render a BarChart for non-time-series data
//         <BarChart width={600} height={300} data={packGraphData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="name" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="value" fill="#8884d8" />
//         </BarChart>
//       )}
//     </div>
//   );
// };

// export default PackDataViewer;
