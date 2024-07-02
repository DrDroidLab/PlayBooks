import { InfoTypes } from "./InfoTypes.ts";

export const cloudwatchMetric = [
  {
    label: "Dimension",
    key: "dimensions.0.name",
    type: InfoTypes.TEXT,
  },
  {
    label: "Metric Name",
    key: "metric_name",
    type: InfoTypes.TEXT,
  },
];
