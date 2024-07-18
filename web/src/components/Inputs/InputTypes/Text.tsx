import React from "react";
import ValueComponent from "../../ValueComponent";
import { InputType } from "../../../types/inputs/inputTypes.ts";

type TextInputTypes = {
  type: InputType;
  label: string;
  value: string;
  handleChange: (val: string) => void;
  error?: string;
};

function Text({
  type,
  label,
  value,
  error,
  handleChange,
  ...props
}: TextInputTypes) {
  return (
    <ValueComponent
      length={200}
      valueOptions={[]}
      placeHolder={`Enter ${label}`}
      valueType={"STRING"}
      onValueChange={handleChange}
      value={value}
      error={error}
      disabled={false}
      {...props}
    />
  );
}

export default Text;
