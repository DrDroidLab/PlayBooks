import { useDispatch } from "react-redux";
import { removeSelected } from "../../../store/features/search/searchSlice.ts";
import Chip from "../Chip/index.tsx";

function SearchChip({ item }) {
  const dispatch = useDispatch();

  return (
    <Chip item={item} handleClick={() => dispatch(removeSelected(item))} />
  );
}

export default SearchChip;
