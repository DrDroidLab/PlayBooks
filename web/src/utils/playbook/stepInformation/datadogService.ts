import { Key } from "../key.ts";
import { InfoTypes } from "./InfoTypes.ts";

export const datadogService = [
  {
    label: "Service",
    key: Key.SERVICE_NAME,
    type: InfoTypes.TEXT,
  },
  {
    label: "Environment",
    key: Key.ENVIRONMENT_NAME,
    type: InfoTypes.TEXT,
  },
  {
    label: "Metric",
    key: Key.METRIC,
    type: InfoTypes.TEXT,
  },
];
