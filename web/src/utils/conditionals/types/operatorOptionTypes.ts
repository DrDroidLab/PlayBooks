export const OperatorOptions = {
  EQUAL_O: "EQUAL_O",
  GREATER_THAN_O: "GREATER_THAN_O",
  LESS_THAN_O: "LESS_THAN_O",
  GREATER_THAN_EQUAL_O: "GREATER_THAN_EQUAL_O",
  LESS_THAN_EQUAL_O: "LESS_THAN_EQUAL_O",
};

export type OperatorOptionType =
  (typeof OperatorOptions)[keyof typeof OperatorOptions];
