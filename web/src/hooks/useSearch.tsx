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
import { useEffect, useRef } from "react";
import React from "react";

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
          options?.filter((option) => !selected.includes(option.label)),
        ),
      );
      return;
    }
    const filtered = options?.filter(
      (option) =>
        option.label.toLowerCase().includes(value.toLowerCase()) &&
        !selected.includes(option.label),
    );
    dispatch(setFilteredOptions(filtered));
  }, [value, options, selected, dispatch]);

  const resetState = () => {
    dispatch(setValue(""));
    dispatch(setIsOpen(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (filteredOptions.length > 0 && isOpen) {
      dispatch(addSelected(filteredOptions[highlightedIndex].label));
    }
    resetState();
  };

  const handleChange = (e) => {
    dispatch(setValue(e.target.value));
    dispatch(setIsOpen(true));
  };

  const handleKeyDown = (e) => {
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

  const highlightMatch = (optionLabel, value) => {
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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
