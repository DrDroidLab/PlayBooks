import useSearch from "../../../hooks/common/useSearch";
import { useDispatch } from "react-redux";
import { handleKeyDown } from "../../../utils/search/handleKeyDown.ts";
import { setIsOpen } from "../../../store/features/search/searchSlice.ts";

type SearchProps = {
  context: string;
};

function SearchForm({ context }: SearchProps) {
  const { value, isOpen, handleSubmit, handleChange } = useSearch(context);
  const dispatch = useDispatch();

  return (
    <form
      className="h-full max-h-[28px] rounded flex-1"
      onSubmit={handleSubmit}>
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
