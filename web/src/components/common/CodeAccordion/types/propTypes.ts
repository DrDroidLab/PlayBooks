import { PropsWithChildren } from "react";
import { LanguageTypes } from "./index.ts";

export type CodeAccordionPropTypes = {
  code: string;
  language: LanguageTypes;
  label: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  defaultOpen?: boolean;
  placeholder?: string;
} & PropsWithChildren;
