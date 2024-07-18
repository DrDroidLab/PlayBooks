import React from "react";
import TypingDropdown from "../../common/TypingDropdown/index.tsx";

type TypingDropdownInputType = {
  value: string;
  handleChange: (val: string) => void;
  options: any[];
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  helpText?: string;
};

function TypingDropdownInput({
  label,
  value,
  placeholder,
  disabled,
  error,
  helpText,
  handleChange,
  options,
  ...props
}: TypingDropdownInputType) {
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
    </div>
  );
}

export default TypingDropdownInput;
