/* eslint-disable react-hooks/exhaustive-deps */
import { CloseRounded } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";

const Search = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selected, setSelected] = useState<string[]>([]);
  const dropdownRef = useRef<any>(null);

  useEffect(() => {
    if (!value) {
      setFilteredOptions(options);
      return;
    }
    const filtered = options.filter((option: any) =>
      option.label.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredOptions(filtered);
  }, [value, options]);

  const resetState = () => {
    setValue("");
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addToArray(value);
  };

  const addToArray = (value: string) => {
    if (selected.includes(value) || value.trim().length === 0) {
      return;
    }
    setSelected((selected) => [...selected, value]);
    resetState();
  };

  const removeFromArray = (val: string) => {
    setSelected((selected) => selected.filter((item) => item !== val));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    setIsOpen(true);
  };

  const highlightMatch = (optionLabel: string, value: string) => {
    const parts = optionLabel.split(new RegExp(`(${value})`, "gi"));
    return (
      <>
        {parts.map((part, index) => (
          <span
            key={index}
            className={
              part.toLowerCase() === value.toLowerCase()
                ? "text-violet-500"
                : undefined
            }>
            {part}
          </span>
        ))}
      </>
    );
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
    <div ref={dropdownRef} className="relative w-full inline-block text-left">
      <div
        className={`flex flex-wrap items-center gap-1 w-full p-2 rounded border border-lightgray bg-white text-sm focus:outline-none`}>
        {selected.map((item: any) => (
          <div
            key={item}
            className="flex gap-1 bg-gray-200 p-1 rounded items-center">
            <p className="text-xs">{item}</p>
            <CloseRounded
              className="cursor-pointer"
              fontSize="small"
              onClick={() => removeFromArray(item)}
            />
          </div>
        ))}
        <form className="h-full rounded flex-1" onSubmit={handleSubmit}>
          <input
            className="w-full h-full rounded outline-none min-w-[200px]"
            type="text"
            placeholder={"Start Searching..."}
            value={value}
            onChange={handleChange}
            onClick={() => setIsOpen(!isOpen)}
          />
        </form>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="origin-top-right absolute left-0 mt-2 w-full max-h-36 overflow-scroll rounded-md shadow-lg bg-white z-10">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu">
            {filteredOptions?.map((option: any, index: number) => (
              <div
                key={index}
                className="block px-4 py-2 text-xs hover:bg-gray-100 hover:text-gray-900 cursor-pointer font-medium"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  addToArray(option.label);
                }}>
                {highlightMatch(option.label, value)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
