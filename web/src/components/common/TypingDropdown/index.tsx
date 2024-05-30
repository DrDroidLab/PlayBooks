import React, { useEffect, useRef, useState } from "react";

const Dropdown = ({ step }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(step.options);
  const dropdownRef = useRef<any>(null);
  const error = "";

  useEffect(() => {
    if (!value) {
      setFilteredOptions(step.options);
      return;
    }
    const filtered = step.options.filter((option: any) =>
      option.label.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredOptions(filtered);
  }, [value, step.options]);

  const resetState = () => {
    setValue("");
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addToArray(value);
  };

  const addToArray = (value: string) => {
    resetState();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    setIsOpen(true);
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
        className={`${
          error ? "border-red" : ""
        } flex flex-wrap items-center gap-2 justify-between w-full rounded border border-lightgray px-4 py-3 bg-white text-lg font-medium text-gray-700 focus:outline-none`}>
        <p className="text-lg">Selected</p>
        <form className="h-full rounded flex-1" onSubmit={handleSubmit}>
          <input
            className="w-full h-full rounded outline-none min-w-[200px]"
            type="text"
            placeholder={step.placeholder}
            value={value}
            onChange={handleChange}
            onClick={() => setIsOpen(!isOpen)}
          />
        </form>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="origin-top-right absolute left-0 mt-2 w-full max-h-36 overflow-scroll rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu">
            {filteredOptions?.map((option: any, index: number) => (
              <div
                key={index}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  addToArray(option.label);
                }}>
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
