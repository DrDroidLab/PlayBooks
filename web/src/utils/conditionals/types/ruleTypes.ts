export const RuleTypes = {
  ROLLING: "ROLLING",
  CUMALATIVE: "CUMALATIVE",
  COLUMN_VALUE: "COLUMN_VALUE",
  GREP_COUNT: "GREP_COUNT",
  GREP: "GREP",
} as const;

export type RuleTypesType = (typeof RuleTypes)[keyof typeof RuleTypes];
