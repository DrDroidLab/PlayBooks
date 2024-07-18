import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const gcmMetricsBuilder = (options: any) => {
  return {
    builder: [
      [
        {
          key: Key.METRIC_TYPE,
          label: "Metric Type",
          type: InputTypes.TYPING_DROPDOWN,
          options: options?.map((el) => {
            return { id: el, label: el };
          }),
        },
      ],
    ],
  };
};
