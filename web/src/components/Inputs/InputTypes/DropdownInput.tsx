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
    <div className={`flex flex-col`}>
      <p
        style={{
          fontSize: "13px",
          color: "#676666",
        }}>
        <b>{label}</b>
      </p>
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
    </div>
  );
}

export default DropdownInput;
