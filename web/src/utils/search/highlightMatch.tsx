import React from "react";

export const highlightMatch = (string: string, value: string) => {
  const parts = string.split(new RegExp(`(${value})`, "gi"));
  return (
    <>
      {parts.map((part, index) => (
        <span
          key={index}
          className={
            part.toLowerCase() === value.toLowerCase()
              ? "text-violet-500"
              : undefined
          }>
          {part}
        </span>
      ))}
    </>
  );
};
