import { CloseRounded } from "@mui/icons-material";
import React from "react";
import { useDispatch } from "react-redux";
import { removeSelected } from "../../../store/features/search/searchSlice.ts";

function SearchChip({ item }) {
  const dispatch = useDispatch();

  return (
    <div key={item} className="flex gap-1 bg-gray-200 p-1 rounded items-center">
      <p className="text-xs">{item}</p>
      <CloseRounded
        className="cursor-pointer"
        fontSize="small"
        onClick={() => dispatch(removeSelected(item))}
      />
    </div>
  );
}

export default SearchChip;
