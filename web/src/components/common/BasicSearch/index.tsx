import { CloseRounded, SearchRounded } from "@mui/icons-material";
import React from "react";

function BasicSearch({
  query,
  setValue,
  placeholder = "Search by name or type...",
  inputClassName = "",
}) {
  return (
    <div className="flex items-center bg-white w-full p-2 gap-2 border rounded">
      <SearchRounded fontSize="small" />
      <input
        className={`${inputClassName} w-full h-full text-base outline-none`}
        placeholder={placeholder}
        value={query}
        onChange={setValue}
      />
      {query && (
        <div onClick={() => setValue()} className="cursor-pointer">
          <CloseRounded fontSize="small" />
        </div>
      )}
    </div>
  );
}

export default BasicSearch;
