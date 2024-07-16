export const ResultTypeTypes = {
  TIMESERIES: "TIMESERIES",
  TABLE: "TABLE",
  BASH_COMMAND_OUTPUT: "BASH_COMMAND_OUTPUT",
  OTHERS: "others",
} as const;

export type ResultTypeType =
  (typeof ResultTypeTypes)[keyof typeof ResultTypeTypes];
