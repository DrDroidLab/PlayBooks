import { Tooltip } from "@mui/material";
import React, { HTMLInputTypeAttribute } from "react";

type TextInputTypes = {
  label?: string;
  value: string;
  handleChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: HTMLInputTypeAttribute;
} & React.InputHTMLAttributes<HTMLInputElement>;

function Text({
  label,
  value,
  error,
  handleChange,
  placeholder,
  disabled,
  className,
  type,
  ...props
}: TextInputTypes) {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleChange(value);
  };

  return (
    <Tooltip title={disabled ? value : ""}>
      <input
        className={`${className} ${
          error ? "border-red-500" : ""
        } border p-2 rounded text-xs outline-none font-normal text-ellipsis min-w-[100px] w-fit max-w-full h-auto`}
        onChange={onChange}
        placeholder={placeholder ?? `${label}`}
        value={value}
        disabled={disabled}
        type={type}
        {...props}
      />
    </Tooltip>
  );
}

export default Text;
