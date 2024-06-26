import { KeyboardEvent } from "react";
import { store } from "../../store/index.ts";
import {
  addSelected,
  removeSelected,
  searchSelector,
  setHighlightedIndex,
  setIsOpen,
  setValue,
} from "../../store/features/search/searchSlice.ts";

export const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
  const dispatch = store.dispatch;
  const { value, filteredOptions, selected, highlightedIndex } = searchSelector(
    store.getState(),
  );

  switch (e.key) {
    case "Backspace":
      if (value.trim().length === 0 && selected.length > 0) {
        dispatch(removeSelected(selected[selected.length - 1]));
      }
      break;
    case "ArrowDown":
      if (filteredOptions.length > 0) {
        dispatch(
          setHighlightedIndex((highlightedIndex + 1) % filteredOptions.length),
        );
      }
      break;
    case "ArrowUp":
      if (filteredOptions.length > 0) {
        dispatch(
          setHighlightedIndex(
            (highlightedIndex - 1 + filteredOptions.length) %
              filteredOptions.length,
          ),
        );
      }
      break;
    case "Enter":
      if (filteredOptions.length > 0) {
        dispatch(addSelected(filteredOptions[highlightedIndex].label));
        dispatch(setValue(""));
        dispatch(setIsOpen(false));
      }
      break;
    default:
      break;
  }
};
