import { Key } from "../key.ts";
import { InfoTypes } from "./InfoTypes.ts";

export const kubectl = [
  {
    label: "cluster",
    key: Key.CLUSTER,
    type: InfoTypes.TEXT,
  },
  {
    label: "Command",
    key: Key.COMMAND,
    type: InfoTypes.TEXT,
  },
];
