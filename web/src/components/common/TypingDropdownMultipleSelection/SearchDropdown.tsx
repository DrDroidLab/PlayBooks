import Form from "./Form";
import DropdownOptions from "../DropdownOptions";
import { useTypingDropdownMultipleContext } from "./contexts/TypingDropdownMultipleContext";

type SearchDropdownPropTypes = {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
};

function SearchDropdown({
  label,
  placeholder,
  disabled,
}: SearchDropdownPropTypes) {
  const {
    dropdownRef,
    handleStringChange,
    handleValueChange,
    value,
    filteredOptions,
    handleSelect,
    isOpen,
  } = useTypingDropdownMultipleContext();
  return (
    <div ref={dropdownRef} className="flex-1 max-w-full relative">
      <Form
        handleChange={handleStringChange}
        handleSubmit={handleValueChange}
        value={value}
        placeholder={placeholder ?? `Enter ${label}`}
      />
      {isOpen && filteredOptions?.length > 0 && !disabled && (
        <DropdownOptions
          options={filteredOptions}
          handleSelect={handleSelect}
        />
      )}
    </div>
  );
}

export default SearchDropdown;
