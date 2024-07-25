import { InfoTypes } from "./InfoTypes.ts";
import { Key } from "../key.ts";

export const smtp = [
  {
    label: "To",
    key: Key.TO,
    type: InfoTypes.TEXT,
  },
  {
    label: "Subject",
    key: Key.SUBJECT,
    type: InfoTypes.TEXT,
  },
];
