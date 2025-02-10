import React from "react";

const TableMetadata = ({ metadata }) => {
  if (!metadata) return <div>Loading table metadata...</div>;

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Metadata for CAN_BMS_Data table:</h3>
      <pre>{JSON.stringify(metadata, null, 2)}</pre>
    </div>
  );
};

export default TableMetadata;
