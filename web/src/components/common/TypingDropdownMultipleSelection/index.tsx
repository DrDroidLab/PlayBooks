import Chip from "../Chip";
import { useTypingDropdownMultipleContext } from "./contexts/TypingDropdownMultipleContext";
import SearchDropdown from "./SearchDropdown";
import { TypingDropdownMultipleSelectionPropTypes } from "./types";

function TypingDropdownMultipleSelection(
  props: TypingDropdownMultipleSelectionPropTypes,
) {
  const { values, handleDelete } = useTypingDropdownMultipleContext();

  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        className={`flex flex-wrap items-center gap-1 w-full p-1 rounded border border-lightgray bg-white text-sm focus:outline-none`}>
        {values?.map((item, index) => (
          <Chip
            key={item}
            item={item}
            handleClick={() => handleDelete(index)}
          />
        ))}

        <SearchDropdown
          label={props.label}
          placeholder={props.placeholder}
          disabled={props.disabled}
        />
      </div>
    </div>
  );
}

export default TypingDropdownMultipleSelection;
