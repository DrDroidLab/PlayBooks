import { Key } from "../key.ts";
import { InfoTypes } from "./InfoTypes.ts";

export const cloudwatchMetric = [
  {
    label: "Dimension",
    key: Key.DIMENSION_NAME,
    type: InfoTypes.TEXT,
  },
  {
    label: "Metric Name",
    key: Key.METRIC_NAME,
    type: InfoTypes.TEXT,
  },
];
