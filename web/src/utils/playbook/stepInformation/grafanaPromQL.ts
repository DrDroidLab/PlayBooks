import { Key } from "../key.ts";
import { InfoTypes } from "./InfoTypes.ts";

export const grafanaPromQL = [
  {
    label: "Datasource",
    key: Key.DATASOURCE_UID,
    type: InfoTypes.TEXT,
  },
  {
    label: "PromQL query",
    key: Key.PROMQL_EXPRESSION,
    type: InfoTypes.TEXT,
  },
];
