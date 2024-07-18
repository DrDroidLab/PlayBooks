import { Key } from "../key.ts";
import { InfoTypes } from "./InfoTypes.ts";

export const elasticSearch = [
  {
    label: "Index",
    key: Key.INDEX,
    type: InfoTypes.TEXT,
  },
  {
    label: "Query",
    key: Key.QUERY,
    type: InfoTypes.TEXT,
  },
];
