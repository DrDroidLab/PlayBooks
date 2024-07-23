import React, { useEffect, useState } from "react";
import useDropdown from "../../../hooks/useDropdown.ts";
import DropdownOptions from "../DropdownOptions/index.tsx";
import DropdownTitle from "../DropdownTitle/index.tsx";

const TypingDropdown = ({
  data,
  selected,
  handleChange: change,
  disabled,
  value,
  ...props
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
      <DropdownTitle
        {...props}
        toggle={toggle}
        value={selected}
        disabled={disabled}
        inputDisabed={false}
        onChange={handleChange}
      />

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
