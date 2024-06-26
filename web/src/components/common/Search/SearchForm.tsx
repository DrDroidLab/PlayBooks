import React from "react";
import useSearch from "../../../hooks/useSearch.ts";
import { useDispatch } from "react-redux";
import { handleKeyDown } from "../../../utils/search/handleKeyDown.ts";
import { setIsOpen } from "../../../store/features/search/searchSlice.ts";

function SearchForm() {
  const { value, isOpen, handleSubmit, handleChange } = useSearch();
  const dispatch = useDispatch();

  return (
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
  );
}

export default SearchForm;
