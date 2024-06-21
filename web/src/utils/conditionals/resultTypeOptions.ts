export const ResultTypeTypes = {
  TIMESERIES: "TIMESERIES",
  TABLE: "TABLE",
  OTHERS: "others",
} as const;

export type ResultTypeType =
  (typeof ResultTypeTypes)[keyof typeof ResultTypeTypes];
