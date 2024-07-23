import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const newRelicNRQLBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.METRIC_NAME,
          label: "Metric Name",
          type: InputTypes.TEXT,
        },
      ],
      [
        {
          key: Key.UNIT,
          label: "Unit",
          type: InputTypes.TEXT,
        },
      ],
      [
        {
          key: Key.NRQL_EXPRESSION,
          label: "NRQL Expression",
          type: InputTypes.MULTILINE,
        },
      ],
    ],
  };
};
