import { CUSTOM_KEY } from "./constants";

export const timeseriesOffsetOptions = [
  {
    id: "now-24",
    label: "1 day ago",
  },
  {
    id: "now-168",
    label: "7 days ago",
  },
  {
    id: CUSTOM_KEY,
    label: "Custom Window",
  },
];
