import React from "react";

function Info({ label, value }) {
  return (
    <div className="flex flex-col">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-black text-sm">{value}</p>
    </div>
  );
}

export default Info;
