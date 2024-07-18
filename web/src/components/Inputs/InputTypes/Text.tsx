import React from "react";
import ValueComponent from "../../ValueComponent";

type TextInputTypes = {
  label?: string;
  value: string;
  handleChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  length?: number;
};

function Text({
  label,
  value,
  error,
  handleChange,
  placeholder,
  length = 200,
}: TextInputTypes) {
  return (
    <ValueComponent
      length={length}
      valueOptions={[]}
      placeHolder={placeholder ?? `Enter ${label}`}
      valueType={"STRING"}
      onValueChange={handleChange}
      value={value}
      error={error}
      disabled={false}
    />
  );
}

export default Text;
