import { InfoTypes } from "./InfoTypes.ts";

export const grafanaPromQL = [
  {
    label: "Datasource",
    key: "datasource",
    type: InfoTypes.TEXT,
  },
  {
    label: "PromQL query",
    key: "grafanaQuery.expression",
    type: InfoTypes.TEXT,
  },
];
