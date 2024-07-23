import React from "react";
import TypingDropdown from "../../common/TypingDropdown/index.tsx";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Add } from "@mui/icons-material";

type TypingDropdownMultipleInputType = {
  value: string;
  handleChange: (val: string) => void;
  handleAddClick: () => void;
  options: any[];
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  helpText?: string;
};

function TypingDropdownMultipleInput({
  label,
  value,
  placeholder,
  disabled,
  error,
  helpText,
  handleChange,
  handleAddClick,
  options,
  ...props
}: TypingDropdownMultipleInputType) {
  return (
    <div className="flex gap-1 items-center">
      <TypingDropdown
        data={options ?? []}
        selected={value}
        placeholder={placeholder ?? `Select ${label}`}
        handleChange={handleChange}
        disabled={disabled}
        error={error}
        {...props}
      />
      <p className="text-xs shrink-0 text-gray-500 font-semibold">{helpText}</p>
      {!disabled && (
        <CustomButton onClick={handleAddClick}>
          <Add fontSize="small" />
        </CustomButton>
      )}
    </div>
  );
}

export default TypingDropdownMultipleInput;
