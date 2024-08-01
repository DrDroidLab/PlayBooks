import { RefObject } from "react";

export type TypingDropdownMultipleContextType = {
  values: any[];
  handleDelete: (index: number) => void;
  dropdownRef: RefObject<HTMLDivElement>;
  handleStringChange: (val: string) => void;
  handleValueChange: (val: string) => void;
  value: string;
  filteredOptions: any[];
  handleSelect: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    option: any,
  ) => void;
  isOpen: boolean;
  toggle: () => void;
  setValue: (val: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};
