import React from "react";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/index.ts";
import useBasicSearch from "../../../hooks/common/useBasicSearch";

type DropdownOptionsPropTypes = {
  options: any[];
  handleSelect: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    option: any,
  ) => void;
};

function DropdownOptions({ options, handleSelect }: DropdownOptionsPropTypes) {
  const { filteredList, query, setValue, isEmpty, notFound } = useBasicSearch(
    options,
    ["label"],
  );

  const handleChange = (val: string) => {
    setValue(val);
  };

  return (
    <div className="origin-top-right absolute left-0 w-full max-h-[200px] overflow-scroll rounded-md shadow-lg bg-white ring-1 ring-gray-200 ring-opacity-5 z-10">
      <div
        className="flex flex-col gap-3 p-2"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu">
        <CustomInput
          inputType={InputTypes.TEXT}
          value={query}
          placeholder="Search options..."
          className="!w-full"
          containerClassName="w-full sticky top-2"
          handleChange={handleChange}
        />
        {notFound && (
          <div
            className="block p-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer rounded-md"
            role="menuitem">
            No options matching
          </div>
        )}
        {isEmpty && (
          <div
            className="block p-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer rounded-md"
            role="menuitem">
            No options available
          </div>
        )}
        {filteredList?.map((option: any, index: number) => (
          <div
            key={index}
            className="block p-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer rounded-md max-w-xs line-clamp-2"
            role="menuitem"
            onClick={(e) => handleSelect(e, option)}>
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DropdownOptions;
