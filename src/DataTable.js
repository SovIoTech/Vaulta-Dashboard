import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@aws-amplify/ui-react";

const DataTable = ({ data }) => {
  if (!data) return <div>Loading data...</div>;

  return (
    <Table variation="default">
      <TableHead>
        <TableRow>
          <TableCell>Key</TableCell>
          <TableCell>Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(data).map(([key, value]) => {
          const displayValue =
            typeof value === "object" ? JSON.stringify(value) : value;
          return (
            <TableRow key={key}>
              <TableCell>{key}</TableCell>
              <TableCell>{displayValue}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default DataTable;
