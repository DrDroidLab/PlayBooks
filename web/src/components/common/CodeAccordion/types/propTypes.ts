import { LanguageTypes } from "./index.ts";

export type CodeAccordionPropTypes = {
  code: string;
  language: LanguageTypes;
  label: string;
  onValueChange?: (value: string) => void;
};
