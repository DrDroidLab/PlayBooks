import React from "react";

function Chips({ value }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {value.map((chip: any, index: number) => (
        <div key={index} className="rounded bg-gray-100 p-1">
          <p className="text-sm">{chip.label}</p>
        </div>
      ))}
    </div>
  );
}

export default Chips;
