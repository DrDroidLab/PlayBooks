/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import useSearch from "../../../hooks/useSearch.ts";
import SearchForm from "./SearchForm.tsx";
import SearchDropdown from "./SearchDropdown.tsx";
import SearchChip from "./SearchChip.tsx";
import CustomButton from "../CustomButton/index.tsx";
import { useSearchOptionsQuery } from "../../../store/features/search/api/index.ts";

type SearchProps = {
  context: string;
  limit: number;
  offset: number;
};

const Search = (props: SearchProps) => {
  const { context } = props;
  const { isOpen, selected, dropdownRef, clear } = useSearch(props);
  useSearchOptionsQuery(context);

  return (
    <div ref={dropdownRef} className="relative w-full inline-block text-left">
      <div className="flex">
        <div
          className={`flex flex-wrap items-center gap-1 w-full p-2 rounded-l border border-lightgray bg-white text-sm focus:outline-none`}>
          {selected?.map((item) => (
            <SearchChip item={item?.label} />
          ))}
          <SearchForm {...props} />
        </div>
        <CustomButton
          onClick={clear}
          className="bg-violet-500 flex items-center p-1 rounded-none rounded-r cursor-pointer text-xs font-medium">
          Clear
        </CustomButton>
      </div>

      {isOpen && <SearchDropdown {...props} />}
    </div>
  );
};

export default Search;
