export const RuleTypes = {
  ROLLING: "ROLLING",
  CUMULATIVE: "CUMULATIVE",
  COLUMN_VALUE: "COLUMN_VALUE",
  ROW_COUNT: "ROW_COUNT",
  GREP_COUNT: "GREP_COUNT",
} as const;

export type RuleTypesType = (typeof RuleTypes)[keyof typeof RuleTypes];
