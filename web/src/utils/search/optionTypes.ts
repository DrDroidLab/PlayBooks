export const SearchOptionTypes = {
  STRING: "STRING",
  ID: "ID",
  STRING_ARRAY: "STRING_ARRAY",
} as const;

export type SearchOptionTypesType =
  (typeof SearchOptionTypes)[keyof typeof SearchOptionTypes];
