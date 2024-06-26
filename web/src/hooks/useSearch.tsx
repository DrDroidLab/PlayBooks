import { useDispatch, useSelector } from "react-redux";
import {
  setValue,
  setIsOpen,
  setFilteredOptions,
  addSelected,
  removeSelected,
  setHighlightedIndex,
  searchSelector,
} from "../store/features/search/searchSlice.ts";
import {
  useEffect,
  useRef,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
} from "react";
import React from "react";

interface Option {
  label: string;
}

const useSearch = () => {
  const dispatch = useDispatch();
  const {
    value,
    isOpen,
    filteredOptions,
    selected,
    highlightedIndex,
    options,
  } = useSelector(searchSelector);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      dispatch(
        setFilteredOptions(
          options?.filter((option: Option) => !selected.includes(option.label)),
        ),
      );
      return;
    }
    const filtered = options?.filter(
      (option: Option) =>
        option.label.toLowerCase().includes(value.toLowerCase()) &&
        !selected.includes(option.label),
    );
    dispatch(setFilteredOptions(filtered));
  }, [value, options, selected, dispatch]);

  const resetState = () => {
    dispatch(setValue(""));
    dispatch(setIsOpen(false));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (filteredOptions.length > 0 && isOpen) {
      dispatch(addSelected(filteredOptions[highlightedIndex].label));
    }
    resetState();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(setValue(e.target.value));
    dispatch(setIsOpen(true));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Backspace" &&
      value.trim().length === 0 &&
      selected.length > 0
    ) {
      dispatch(removeSelected(selected[selected.length - 1]));
    } else if (e.key === "ArrowDown" && filteredOptions.length > 0) {
      dispatch(
        setHighlightedIndex((highlightedIndex + 1) % filteredOptions.length),
      );
    } else if (e.key === "ArrowUp" && filteredOptions.length > 0) {
      dispatch(
        setHighlightedIndex(
          (highlightedIndex - 1 + filteredOptions.length) %
            filteredOptions.length,
        ),
      );
    } else if (e.key === "Enter" && filteredOptions.length > 0) {
      dispatch(addSelected(filteredOptions[highlightedIndex].label));
      resetState();
    }
  };

  const highlightMatch = (optionLabel: string, value: string) => {
    const parts = optionLabel.split(new RegExp(`(${value})`, "gi"));
    return (
      <>
        {parts.map((part, index) => (
          <span
            key={index}
            className={
              part.toLowerCase() === value.toLowerCase()
                ? "text-violet-500"
                : undefined
            }>
            {part}
          </span>
        ))}
      </>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        dispatch(setIsOpen(false));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, dispatch]);

  return {
    value,
    isOpen,
    filteredOptions,
    selected,
    highlightedIndex,
    handleSubmit,
    handleChange,
    handleKeyDown,
    highlightMatch,
    dropdownRef,
    resetState,
  };
};

export default useSearch;
