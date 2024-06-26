/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import useSearch from "../../../hooks/useSearch.ts";
import { setOptions } from "../../../store/features/search/searchSlice.ts";
import { useDispatch } from "react-redux";
import SearchForm from "./SearchForm.tsx";
import SearchDropdown from "./SearchDropdown.tsx";
import SearchChip from "./SearchChip.tsx";
import CustomButton from "../CustomButton/index.tsx";

const Search = ({ options }) => {
  const { isOpen, selected, dropdownRef, clear } = useSearch();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setOptions(options));
  }, [dispatch, options]);

  return (
    <div ref={dropdownRef} className="relative w-full inline-block text-left">
      <div className="flex">
        <div
          className={`flex flex-wrap items-center gap-1 w-full p-2 rounded-l border border-lightgray bg-white text-sm focus:outline-none`}>
          {selected.map((item) => (
            <SearchChip item={item} />
          ))}
          <SearchForm />
        </div>
        <CustomButton
          onClick={clear}
          className="bg-violet-500 flex items-center p-1 rounded-none rounded-r cursor-pointer text-xs font-medium">
          Clear
        </CustomButton>
      </div>

      {isOpen && <SearchDropdown />}
    </div>
  );
};

export default Search;
