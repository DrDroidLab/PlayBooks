import { Key } from "../key.ts";
import { InfoTypes } from "./InfoTypes.ts";

export const newRelicDashboard = [
  {
    label: "Dashboard Name",
    key: Key.DASHBOARD_NAME,
    type: InfoTypes.TEXT,
  },
  {
    label: "Page name",
    key: Key.PAGE_NAME,
    type: InfoTypes.TEXT,
  },
  {
    label: "Widget",
    key: Key.WIDGET_NRQL_EXPRESSION,
    type: InfoTypes.TEXT,
  },
];
