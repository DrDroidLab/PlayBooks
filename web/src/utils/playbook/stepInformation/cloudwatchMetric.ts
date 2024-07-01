import { InfoTypes } from "./InfoTypes.ts";

export const cloudwatchMetric = [
  {
    label: "Dimension",
    key: "dimension_name",
    type: InfoTypes.TEXT,
  },
  {
    label: "Metrics",
    key: "metric",
    type: InfoTypes.CHIPS,
  },
];
