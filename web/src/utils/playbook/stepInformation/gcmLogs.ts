import { Key } from "../key.ts";
import { InfoTypes } from "./InfoTypes.ts";

export const gcmLogs = [
  {
    label: "Log Name",
    key: Key.LOG_NAME,
    type: InfoTypes.TEXT,
  },
  {
    label: "Filter Query",
    key: Key.FILTER_QUERY,
    type: InfoTypes.TEXT,
  },
];
