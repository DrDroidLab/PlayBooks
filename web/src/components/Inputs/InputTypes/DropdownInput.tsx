import React from "react";
import SelectComponent from "../../SelectComponent";

type DropdownInputType = {
  value: string;
  handleChange: (val: string) => void;
  options: any[];
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};

function DropdownInput({
  label,
  value,
  handleChange,
  disabled,
  error,
  options,
  ...props
}: DropdownInputType) {
  return (
    <SelectComponent
      data={options ?? []}
      placeholder={`Select ${label}`}
      onSelectionChange={handleChange}
      selected={value}
      searchable={true}
      disabled={disabled}
      error={error}
      containerClassName={"min-w-56 max-w-full"}
      {...props}
    />
  );
}

export default DropdownInput;
