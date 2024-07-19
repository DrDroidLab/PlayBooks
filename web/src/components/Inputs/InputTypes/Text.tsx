import React from "react";
import ValueComponent from "../../ValueComponent";
import { InputType, InputTypes } from "../../../types/inputs/inputTypes.ts";

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
    <div
      className={`flex ${
        type === InputTypes.TEXT
          ? "flex-col"
          : "flex-row items-center justify-center gap-2"
      } ${type === InputTypes.TEXT ? "" : "mt-2"}`}>
      <p
        style={{
          marginTop: type === InputTypes.TEXT ? "10px" : "",
          fontSize: "13px",
          color: "#676666",
        }}>
        <b>{label}</b>
      </p>
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
    </div>
  );
}

export default Text;
