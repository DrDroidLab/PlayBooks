import { Add, CloseRounded } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";

const TypingDropdownMultiple = ({
  data,
  selected,
  error,
  handleChange: change,
  disabled,
  placeholder,
  selectedDisplayKey = "label",
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(data);
  const dropdownRef = useRef<any>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!value) {
      setFilteredOptions(data);
      return;
    }
    const filtered = data?.filter((option: any) =>
      option?.label?.toLowerCase()?.includes(value?.toLowerCase()),
    );
    setFilteredOptions(filtered);
  }, [value, data]);

  const resetState = () => {
    setValue("");
    setIsOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    setIsOpen(true);
  };

  const addToArray = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.FormEvent<HTMLFormElement>,
    option?: any,
  ) => {
    e.preventDefault();
    const arr = structuredClone(selected ?? []);
    if (
      arr?.findIndex((e) => e.label === (option?.label ?? value.trim())) !== -1
    )
      return;
    arr.push(option ?? { label: value.trim(), id: value.trim() });
    change(arr);
    resetState();
  };

  const handleDelete = (e) => {
    const arr = structuredClone(selected ?? []);
    const index = arr.findIndex((el) => el.label === e.label);
    arr.splice(index, 1);
    change(arr);
    resetState();
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
      <form onSubmit={addToArray} className="flex items-center gap-2">
        <div
          style={{
            backgroundColor: disabled ? "#efefef" : "",
          }}
          className={`${
            error ? "border-red" : ""
          } flex flex-wrap items-center gap-2 max-w-[220px] justify-between w-full rounded border border-lightgray p-2 bg-white text-xs font-medium text-gray-700 focus:outline-none`}>
          <input
            className="w-full h-full rounded outline-none max-w-full min-w-[200px] font-medium"
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
          />
        </div>
        <button className="p-1 text-sm rounded border border-violet-500 hover:bg-violet-500 hover:text-white bg-white text-violet-500 transition-all">
          <Add fontSize="inherit" />
        </button>
      </form>

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
                onClick={(e) => addToArray(e, option)}>
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex mt-2 gap-1 items-center flex-wrap">
        {selected?.map((e) => (
          <div className="flex items-center text-xs rounded p-1 bg-gray-100 cursor-pointer font-semibold">
            <span>{e[selectedDisplayKey]}</span>
            {!disabled && (
              <div onClick={() => handleDelete(e)}>
                <CloseRounded fontSize="small" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypingDropdownMultiple;
