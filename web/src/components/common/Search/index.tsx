/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import useSearch from "../../../hooks/useSearch.ts";
import SearchForm from "./SearchForm.tsx";
import SearchDropdown from "./SearchDropdown.tsx";
import SearchChip from "./SearchChip.tsx";
import CustomButton from "../CustomButton/index.tsx";
import { useSearchOptionsQuery } from "../../../store/features/search/api/searchOptionsApi.ts";

type SearchProps = {
  options: any;
  context: string;
};

const Search = ({ options, context }: SearchProps) => {
  useSearchOptionsQuery(context);
  const { isOpen, selected, dropdownRef, clear } = useSearch();
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(setOptions(options));
  // }, [dispatch, options]);

  console.log("select", selected);

  return (
    <div ref={dropdownRef} className="relative w-full inline-block text-left">
      <div className="flex">
        <div
          className={`flex flex-wrap items-center gap-1 w-full p-2 rounded-l border border-lightgray bg-white text-sm focus:outline-none`}>
          {selected?.map((item) => (
            <SearchChip item={item?.label} />
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
