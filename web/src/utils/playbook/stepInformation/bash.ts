import { Key } from "../key.ts";
import { InfoTypes } from "./InfoTypes.ts";

export const bash = [
  {
    label: "Server",
    key: Key.REMOTE_SERVER,
    type: InfoTypes.TEXT,
  },
  {
    label: "Command",
    key: Key.COMMAND,
    type: InfoTypes.TEXT,
  },
];
