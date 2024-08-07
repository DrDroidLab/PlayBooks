import { InfoTypes } from "./InfoTypes.ts";
import { Key } from "../key.ts";

export const slack = [
  {
    label: "Channel",
    key: Key.CHANNEL,
    type: InfoTypes.TEXT,
  },
  {
    label: "Message",
    key: Key.TEXT,
    type: InfoTypes.TEXT,
  },
];
