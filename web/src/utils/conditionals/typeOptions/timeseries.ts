import { RuleTypes } from "../types/ruleTypes.ts";

export const timeseriesOptions = [
  {
    id: RuleTypes.ROLLING,
    label: "Rolling",
  },
  {
    id: RuleTypes.CUMULATIVE,
    label: "Cumulative",
  },
];
