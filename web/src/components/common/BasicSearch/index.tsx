import { CloseRounded, SearchRounded } from "@mui/icons-material";
import React from "react";

function BasicSearch({ query, setValue }) {
  return (
    <div className="flex items-center bg-white w-full p-2 gap-2 border rounded">
      <SearchRounded />
      <input
        className="w-full h-full text-base outline-none"
        placeholder="Search by name or type..."
        value={query}
        onChange={setValue}
      />
      {query && (
        <div onClick={() => setValue()} className="cursor-pointer">
          <CloseRounded />
        </div>
      )}
    </div>
  );
}

export default BasicSearch;
