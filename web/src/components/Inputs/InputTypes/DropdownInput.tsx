import React from "react";
import DropdownOptions from "../../common/DropdownOptions/index.tsx";
import DropdownTitle from "../../common/DropdownTitle/index.tsx";
import useDropdown from "../../../hooks/common/useDropdown.ts";

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
  handleChange,
  options,
  value,
  disabled,
  error,
  ...props
}: DropdownInputType) {
  const { dropdownRef, handleSelect, isOpen, toggle } =
    useDropdown(handleChange);

  const selectedValue = value ? options.find((e) => e.id === value)?.label : "";

  return (
    <div ref={dropdownRef} className="relative w-fit inline-block text-left">
      <DropdownTitle
        {...props}
        toggle={toggle}
        value={selectedValue}
        showIcon={true}
        inputDisabed={true}
        isOpen={isOpen}
        disabled={disabled}
        error={!!error}
        className={`!min-w-[100px] pointer-events-none`}
      />

      {isOpen && !disabled && (
        <DropdownOptions options={options} handleSelect={handleSelect} />
      )}
    </div>
  );
}

export default DropdownInput;
