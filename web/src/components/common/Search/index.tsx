/* eslint-disable react-hooks/exhaustive-deps */
import { CloseRounded } from "@mui/icons-material";
import React, { useEffect } from "react";
import useSearch from "../../../hooks/useSearch.tsx";
import {
  addSelected,
  removeSelected,
  setIsOpen,
  setOptions,
} from "../../../store/features/search/searchSlice.ts";
import { useDispatch } from "react-redux";

const Search = ({ options }) => {
  const {
    value,
    isOpen,
    filteredOptions,
    selected,
    highlightedIndex,
    handleSubmit,
    handleChange,
    handleKeyDown,
    highlightMatch,
    dropdownRef,
    resetState,
  } = useSearch();
  const dispatch = useDispatch();

  useEffect(() => {
    // Set initial options
    dispatch(setOptions(options));
  }, [dispatch, options]);

  return (
    <div ref={dropdownRef} className="relative w-full inline-block text-left">
      <div
        className={`flex flex-wrap items-center gap-1 w-full p-2 rounded border border-lightgray bg-white text-sm focus:outline-none`}>
        {selected.map((item) => (
          <div
            key={item}
            className="flex gap-1 bg-gray-200 p-1 rounded items-center">
            <p className="text-xs">{item}</p>
            <CloseRounded
              className="cursor-pointer"
              fontSize="small"
              onClick={() => dispatch(removeSelected(item))}
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
            onClick={() => dispatch(setIsOpen(!isOpen))}
            onKeyDown={handleKeyDown}
          />
        </form>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute left-0 mt-2 w-full max-h-36 overflow-scroll rounded-md shadow-lg bg-white z-10">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu">
            {filteredOptions.length === 0 && (
              <p className="text-xs font-medium px-4 py-2">No matches found</p>
            )}
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                className={`block px-4 py-2 text-xs hover:bg-gray-100 hover:text-gray-900 cursor-pointer font-medium ${
                  index === highlightedIndex ? "bg-gray-200" : ""
                }`}
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(addSelected(option.label));
                  resetState();
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
