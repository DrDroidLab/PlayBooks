import { HTMLInputTypeAttribute } from "react";

export type TypingDropdownMultipleSelectionPropTypes = {
  label?: string;
  value: string[];
  handleChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  options?: any[];
  type?: HTMLInputTypeAttribute;
  typingContainerClassname?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;
