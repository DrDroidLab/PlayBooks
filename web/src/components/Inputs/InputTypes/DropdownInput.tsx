import React from "react";
import SelectComponent from "../../SelectComponent";

type DropdownInputType = {
  label: string;
  value: string;
  handleChange: (val: string) => void;
  options: any[];
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
      containerClassName={"w-56"}
      {...props}
    />
  );
}

export default DropdownInput;
