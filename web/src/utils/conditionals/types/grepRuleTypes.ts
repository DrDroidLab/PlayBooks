export const GrepRuleTypes = {
  GREP_EXISTS: "GREP_EXISTS",
  GREP_DOES_NOT_EXIST: "GREP_DOES_NOT_EXIST",
  GREP_COUNT: "GREP_COUNT",
} as const;

export type GrepRuleTypesType =
  (typeof GrepRuleTypes)[keyof typeof GrepRuleTypes];
