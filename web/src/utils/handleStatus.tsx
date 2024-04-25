import React from "react";

export const handleStatus = (status) => {
  let className = "border p-1 text-sm bg-gray-50 w-fit rounded ";
  switch (status) {
    case "CREATED":
      className += "bg-gray-200";
      break;

    case "RUNNING":
      className += "bg-blue-200";
      break;

    case "FINISHED":
      className += "bg-green-200";
      break;

    case "FAILED":
      className += "bg-red-200";
      break;

    default:
      break;
  }
  return <div className={className}>{status}</div>;
};
