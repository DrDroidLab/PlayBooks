import { Key } from "../key.ts";
import { InfoTypes } from "./InfoTypes.ts";

export const azureLogs = [
  {
    label: "Workspace",
    key: Key.WORKSPACE_ID,
    type: InfoTypes.TEXT,
  },
  {
    label: "Log Query",
    key: Key.FILTER_QUERY,
    type: InfoTypes.TEXT,
  },
];
