import { CUSTOM_KEY } from "./constants";

export const timeseriesOffsetOptions = [
  {
    id: "now-24",
    label: "Last 1 day",
  },
  {
    id: "now-168",
    label: "Last 7 days",
  },
  {
    id: CUSTOM_KEY,
    label: "Custom",
  },
];
