import { Key } from "../key.ts";
import { InfoTypes } from "./InfoTypes.ts";

export const eks = [
  {
    label: "cluster",
    key: Key.CLUSTER,
    type: InfoTypes.TEXT,
  },
  {
    label: "Namespace",
    key: Key.NAMESPACE,
    type: InfoTypes.TEXT,
  },
];
