import React, { useEffect, useState } from "react";
import useDropdown from "../../../hooks/useDropdown.ts";
import DropdownOptions from "../DropdownOptions/index.tsx";

const TypingDropdown = ({
  data,
  selected,
  error,
  handleChange: change,
  disabled,
  placeholder,
}: any) => {
  const { dropdownRef, handleSelect, isOpen, setIsOpen, toggle } =
    useDropdown(change);
  const [filteredOptions, setFilteredOptions] = useState(data);

  useEffect(() => {
    if (!selected) {
      setFilteredOptions(data);
      return;
    }
    const filtered = data?.filter((option: any) =>
      option?.label?.toLowerCase().includes(selected?.toLowerCase()),
    );
    setFilteredOptions(filtered);
  }, [selected, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    change(val);
    setIsOpen(true);
  };

  return (
    <div ref={dropdownRef} className="relative w-full inline-block text-left">
      <div
        style={{
          backgroundColor: disabled ? "#efefef" : "",
        }}
        className={`${
          error ? "border-red-500" : ""
        } flex flex-wrap items-center gap-2 justify-between w-full rounded border p-2 bg-white text-xs font-medium text-gray-700 focus:outline-none overflow-hidden`}>
        <input
          className="w-full h-full rounded outline-none max-w-full min-w-[200px] font-medium text-ellipsis"
          type="text"
          placeholder={placeholder}
          value={selected}
          onChange={handleChange}
          onClick={toggle}
          disabled={disabled}
        />
      </div>

      {isOpen && filteredOptions?.length > 0 && !disabled && (
        <DropdownOptions
          options={filteredOptions}
          handleSelect={handleSelect}
        />
      )}
    </div>
  );
};

export default TypingDropdown;
