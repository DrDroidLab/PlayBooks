import { createContext, useContext, useState, useEffect } from "react";
import useDropdown from "../../../../hooks/common/useDropdown";
import {
  TypingDropdownMultipleContextType,
  TypingDropdownMultipleProviderProps,
} from "../types";

const TypingDropdownMultipleContext = createContext<
  TypingDropdownMultipleContextType | undefined
>(undefined);

export const TypingDropdownMultipleProvider = ({
  children,
  value: selectedValues,
  handleChange,
  options,
}: TypingDropdownMultipleProviderProps) => {
  const [values, setValues] = useState<string[]>(selectedValues ?? [""]);
  const [value, setValue] = useState<string>("");
  const { dropdownRef, handleSelect, isOpen, setIsOpen, toggle } =
    useDropdown(handleValueChange);
  const [filteredOptions, setFilteredOptions] = useState<any[]>(options ?? []);

  const handleDelete = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    setValues(newValues);
    handleChange(JSON.stringify(newValues));
  };

  const handleStringChange = (val: string) => {
    setValue(val);
    setIsOpen(true);
  };

  function handleValueChange(val: string) {
    const newValues = [...values, val];
    setValues(newValues);
    handleChange(JSON.stringify(newValues));
  }

  useEffect(() => {
    if (!values) {
      setFilteredOptions(options!);
      return;
    }
    const filtered = options?.filter((option: any) =>
      option?.label?.toLowerCase().includes(value?.toLowerCase()),
    );
    setFilteredOptions(filtered!);
  }, [value, options]);

  return (
    <TypingDropdownMultipleContext.Provider
      value={{
        values,
        handleDelete,
        dropdownRef,
        handleStringChange,
        handleValueChange,
        value,
        filteredOptions,
        handleSelect,
        isOpen,
        toggle,
      }}>
      {children}
    </TypingDropdownMultipleContext.Provider>
  );
};

export const useTypingDropdownMultipleContext = () => {
  const context = useContext(TypingDropdownMultipleContext);
  if (!context) {
    throw new Error(
      "useTypingDropdownMultipleContext must be used within a DropdownProvider",
    );
  }
  return context;
};
