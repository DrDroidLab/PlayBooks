import React, { useState } from "react";
import RadioOptions from "../common/RadioOptions/index.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import CopyCode from "../common/CopyCode/index.jsx";

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

function PlaybookAPIActionOutput({ output }) {
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

      <HandleSelectedRender output={output} selectedId={selected} />
    </div>
  );
}

export default PlaybookAPIActionOutput;

const HandleSelectedRender = ({ selectedId, output }) => {
  const headers = output.response_headers;
  switch (selectedId) {
    case "body":
      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            className={
              "my-2 bg-white max-w-xl rounded-lg border resize-none p-2 text-sm overflow-scroll h-48"
            }>
            <CopyCode
              content={JSON.stringify(output.response_body, null, 2) ?? ""}
              language={"json"}
            />
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
