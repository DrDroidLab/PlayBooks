import { KeyboardArrowDownRounded } from "@mui/icons-material";
import React from "react";
import DropdownOptions from "../../common/DropdownOptions/index.tsx";
import useDropdown from "../../../hooks/useDropdown.ts";

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
  placeholder,
}: DropdownInputType) {
  const { dropdownRef, handleSelect, isOpen, toggle } =
    useDropdown(handleChange);

  return (
    <div ref={dropdownRef} className="relative w-fit inline-block text-left">
      <div
        onClick={toggle}
        className={`${
          error ? "border-red-500" : ""
        } flex items-center gap-2 justify-between w-full rounded border p-2 bg-white text-xs font-medium text-gray-700 focus:outline-none overflow-hidden cursor-pointer`}>
        <input
          className="w-full h-full rounded outline-none max-w-full min-w-[100px] font-medium text-ellipsis disabled:bg-transparent pointer-events-none"
          type="text"
          placeholder={placeholder ?? `Select ${label}`}
          value={
            value !== undefined && value !== ""
              ? options.find((e) => e.id === value)?.label
              : ""
          }
          onClick={() => console.log("woho")}
          disabled={true}
        />
        <KeyboardArrowDownRounded
          fontSize="small"
          className={`${
            isOpen ? "rotate-180" : "rotate-0"
          } text-gray-600 !transition-all`}
        />
      </div>

      {isOpen && !disabled && (
        <DropdownOptions options={options} handleSelect={handleSelect} />
      )}
    </div>
  );
}

export default DropdownInput;
