import { useDispatch, useSelector } from "react-redux";
import {
  setValue,
  setIsOpen,
  setFilteredOptions,
  addSelected,
  searchSelector,
  setSelected,
  clear,
} from "../../store/features/search/searchSlice.ts";
import { useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearchQuery } from "../../store/features/search/api/searchApi.ts";

interface Option {
  label: string;
}

const useSearch = (context: string) => {
  const dispatch = useDispatch();
  const {
    value,
    isOpen,
    filteredOptions,
    selected,
    highlightedIndex,
    options,
  } = useSelector(searchSelector);
  const { data, refetch, isFetching } = useSearchQuery({ context, selected });

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
      dispatch(addSelected(filteredOptions[highlightedIndex]));
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
          options?.filter(
            (option: Option) =>
              selected.findIndex((e) =>
                e.label.includes(option.label.split(": ")[0]),
              ) === -1,
          ),
        ),
      );
      return;
    }
    const filtered = options?.filter(
      (option: Option) =>
        option.label.toLowerCase().includes(value.toLowerCase()) &&
        selected.findIndex((e) => e.label === option.label) === -1,
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
      dispatch(
        setSelected(
          selectedArray
            .map((selected) => options.find((e) => e.label === selected))
            .filter((e) => e),
        ),
      );
    }
  }, [dispatch, searchParams, options]);

  useEffect(() => {
    if (options?.length === 0) return;
    if (selected.length > 0) {
      searchParams.set("selected", selected.map((e) => e.label).join(","));
    } else {
      searchParams.delete("selected");
    }
    setSearchParams(searchParams);
  }, [selected, setSearchParams, searchParams, options]);

  useEffect(() => {
    if (!isFetching) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, selected]);

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
    data,
    isFetching,
    refetch,
  };
};

export default useSearch;
