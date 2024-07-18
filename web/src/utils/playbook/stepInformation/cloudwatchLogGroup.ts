import { Key } from "../key.ts";
import { InfoTypes } from "./InfoTypes.ts";

export const cloudwatchLogGroup = [
  {
    label: "Query",
    key: Key.FILTER_QUERY,
    type: InfoTypes.TEXT,
  },
];
