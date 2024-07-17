import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Task } from "../../types/index.ts";
import { Key } from "../playbook/key.ts";
import { getCurrentAsset } from "../playbook/getCurrentAsset.ts";

export const gcmMetricsBuilder = (options: any, task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.REGION,
          label: "Region",
          type: InputTypes.TYPING_DROPDOWN,
          options: options?.map((namespace) => {
            return {
              id: namespace,
              label: namespace,
            };
          }),
        },
        {
          key: Key.METRIC_TYPE,
          label: "Metric Type",
          type: InputTypes.TYPING_DROPDOWN,
          options: getCurrentAsset(
            task,
            Key.NAMESPACE,
            "namespace",
          )?.region_dimension_map?.map((el) => {
            return { id: el.region, label: el.region };
          }),
        },
      ],
    ],
  };
};
