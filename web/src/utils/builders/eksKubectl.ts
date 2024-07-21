import { Key } from "../playbook/key.ts";
import { Task } from "../../types/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { getTaskData } from "../playbook/getTaskData.ts";

export const eksKubectlBuilder = (options: any, task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.REGION,
          label: "Region",
          type: InputTypes.TYPING_DROPDOWN,
          options:
            options?.map((x) => ({ id: x.region, label: x.region })) ?? [],
        },
        {
          key: Key.CLUSTER,
          label: "Cluster",
          type: InputTypes.TYPING_DROPDOWN,
          options: options
            ?.find((e) => e.region === getTaskData(task)?.[Key.REGION])
            ?.clusters?.map((x) => ({ id: x.name, label: x.name })),
        },
        {
          key: Key.COMMAND,
          label: "Kubectl Command",
          type: InputTypes.MULTILINE,
        },
      ],
    ],
  };
};
