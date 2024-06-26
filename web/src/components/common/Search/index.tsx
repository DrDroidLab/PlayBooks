/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import useSearch from "../../../hooks/useSearch.ts";
import { setOptions } from "../../../store/features/search/searchSlice.ts";
import { useDispatch } from "react-redux";
import SearchForm from "./SearchForm.tsx";
import SearchDropdown from "./SearchDropdown.tsx";
import SearchChip from "./SearchChip.tsx";

const Search = ({ options }) => {
  const { isOpen, selected, dropdownRef } = useSearch();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setOptions(options));
  }, [dispatch, options]);

  return (
    <div ref={dropdownRef} className="relative w-full inline-block text-left">
      <div
        className={`flex flex-wrap items-center gap-1 w-full p-2 rounded border border-lightgray bg-white text-sm focus:outline-none`}>
        {selected.map((item) => (
          <SearchChip item={item} />
        ))}
        <SearchForm />
      </div>

      {isOpen && <SearchDropdown />}
    </div>
  );
};

export default Search;
