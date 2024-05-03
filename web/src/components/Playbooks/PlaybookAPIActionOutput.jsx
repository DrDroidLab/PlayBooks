import React, { useState } from "react";
import RadioOptions from "../common/RadioOptions/index.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

const options = [
  {
    id: "body",
    label: "Body",
  },
  {
    id: "headers",
    label: "Response Headers",
  },
];

function PlaybookAPIActionOutput({ result, step, timestamp }) {
  const [selected, setSelected] = useState("body");

  const handleChange = (option) => {
    setSelected(option.id);
  };

  return (
    <div>
      <RadioOptions
        options={options}
        selectedId={selected}
        handleSelect={handleChange}
      />

      <HandleSelectedRender step={step} selectedId={selected} />
    </div>
  );
}

export default PlaybookAPIActionOutput;

const HandleSelectedRender = ({ selectedId, step }) => {
  const headers = JSON.parse(step.action.headers);
  switch (selectedId) {
    case "body":
      return (
        <div
          style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div
            className={
              "my-2 bg-white rounded-lg border resize-none p-2 text-sm overflow-scroll h-32"
            }>
            <pre>{step?.action?.payload}</pre>
          </div>
        </div>
      );
    case "headers":
      return (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(headers ?? {}).map((key) => (
              <TableRow key={key}>
                <TableCell>{key}</TableCell>
                <TableCell>{headers[key]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    default:
      return <></>;
  }
};
