import { Task } from "../../types/index.ts";
import { Key } from "../playbook/key.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { getTaskData } from "../playbook/getTaskData.ts";

export const gkeKubectlBuilder = (options: any, task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.ZONE,
          label: "Zone",
          type: InputTypes.TYPING_DROPDOWN,
          options: options?.map((x) => ({ id: x.zone, label: x.zone })) ?? [],
        },
        {
          key: Key.CLUSTER,
          label: "Cluster",
          type: InputTypes.TYPING_DROPDOWN,
          options: options
            ?.find((e) => e.zone === getTaskData(task)?.zone)
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
