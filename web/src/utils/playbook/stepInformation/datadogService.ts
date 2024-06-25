import { InfoTypes } from "./InfoTypes.ts";

export const datadogService = [
  {
    label: "Service",
    key: "datadogService",
    type: InfoTypes.TEXT,
  },
  {
    label: "Environment",
    key: "datadogEnvironment",
    type: InfoTypes.TEXT,
  },
  {
    label: "Metrics",
    key: "datadogMetric",
    type: InfoTypes.CHIPS,
  },
];
