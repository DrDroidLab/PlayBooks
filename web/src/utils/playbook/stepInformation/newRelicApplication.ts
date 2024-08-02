import { Key } from "../key.ts";
import { InfoTypes } from "./InfoTypes.ts";

export const newRelicApplication = [
  {
    label: "Application",
    key: Key.APPLICATION_ENTITY_NAME,
    type: InfoTypes.TEXT,
  },
  {
    label: "Metrics",
    key: Key.GOLDEN_METRIC_NAME,
    type: InfoTypes.TEXT,
  },
];
