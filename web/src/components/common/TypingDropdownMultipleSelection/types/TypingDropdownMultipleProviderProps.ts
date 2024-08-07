import { PropsWithChildren } from "react";

export type TypingDropdownMultipleProviderProps = {
  value: any[];
  handleChange: (val: string) => void;
  options: any[];
} & PropsWithChildren;
