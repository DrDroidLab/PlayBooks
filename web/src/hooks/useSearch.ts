import { useDispatch, useSelector } from "react-redux";
import {
  setValue,
  setIsOpen,
  setFilteredOptions,
  addSelected,
  searchSelector,
  setSelected,
  clear,
} from "../store/features/search/searchSlice.ts";
import { useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

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
  const [searchParams, setSearchParams] = useSearchParams();

  const resetState = () => {
    dispatch(setValue(""));
    dispatch(setIsOpen(false));
  };

  const clearFunction = () => {
    dispatch(clear());
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

  useEffect(() => {
    const selectedParams = searchParams.get("selected");
    if (selectedParams) {
      const selectedArray = selectedParams.split(",");
      dispatch(setSelected(selectedArray));
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    if (selected.length > 0) {
      searchParams.set("selected", selected.join(","));
    } else {
      searchParams.delete("selected");
    }
    setSearchParams(searchParams);
  }, [selected, setSearchParams, searchParams]);

  return {
    value,
    isOpen,
    filteredOptions,
    selected,
    highlightedIndex,
    handleSubmit,
    handleChange,
    dropdownRef,
    resetState,
    clear: clearFunction,
  };
};

export default useSearch;
