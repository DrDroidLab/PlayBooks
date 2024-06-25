import { InfoTypes } from "./InfoTypes.ts";

export const newRelicApplication = [
  {
    label: "Application",
    key: "application_name",
    type: InfoTypes.TEXT,
  },
  {
    label: "Metrics",
    key: "golden_metrics",
    type: InfoTypes.CHIPS,
  },
];
