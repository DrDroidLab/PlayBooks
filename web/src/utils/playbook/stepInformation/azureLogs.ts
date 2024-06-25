import { InfoTypes } from "./InfoTypes.ts";

export const azureLogs = [
  {
    label: "Workspace",
    key: "workspaceName",
    type: InfoTypes.TEXT,
  },
  {
    label: "Log Query",
    key: "filter_query",
    type: InfoTypes.TEXT,
  },
];
