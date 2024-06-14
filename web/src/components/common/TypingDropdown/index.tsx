import React, { useEffect, useRef, useState } from "react";

const TypingDropdown = ({
  data,
  selected,
  error,
  handleChange: change,
  disabled,
  placeholder,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(data);
  const dropdownRef = useRef<any>(null);

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

  const handleSelect = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    option: any,
  ) => {
    e.preventDefault();
    change(option.label, option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        dropdownRef?.current &&
        !dropdownRef?.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div
      ref={dropdownRef}
      className="relative w-full inline-block text-left overflow-hidden">
      <div
        style={{
          backgroundColor: disabled ? "#efefef" : "",
        }}
        className={`${
          error ? "border-red" : ""
        } flex flex-wrap items-center gap-2 justify-between w-full rounded border border-lightgray p-2 bg-white text-xs font-medium text-gray-700 focus:outline-none overflow-hidden`}>
        <input
          className="w-full h-full rounded outline-none max-w-full min-w-[200px] font-medium text-ellipsis"
          type="text"
          placeholder={placeholder}
          value={selected}
          onChange={handleChange}
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        />
      </div>

      {isOpen && filteredOptions?.length > 0 && !disabled && (
        <div className="origin-top-right absolute left-0 w-full max-h-[200px] overflow-scroll rounded-md shadow-lg bg-white ring-1 ring-gray-200 ring-opacity-5 z-10">
          <div
            className="flex flex-col gap-3 p-2"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu">
            {filteredOptions?.map((option: any, index: number) => (
              <div
                key={index}
                className="block p-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer rounded-md"
                role="menuitem"
                onClick={(e) => handleSelect(e, option)}>
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingDropdown;
