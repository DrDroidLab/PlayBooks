import { Key } from "../playbook/key.ts";
import { Task } from "../../types/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { getTaskData } from "../playbook/getTaskData.ts";
import { getCurrentAsset } from "../playbook/getCurrentAsset.ts";

export const eksBuilder = (options: any, task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.REGION,
          label: "Region",
          inputType: InputTypes.TYPING_DROPDOWN,
          options:
            options?.map((x) => ({ id: x.region, label: x.region })) ?? [],
        },
        {
          key: Key.CLUSTER,
          label: "Cluster",
          inputType: InputTypes.TYPING_DROPDOWN,
          options: options
            ?.find((e) => e.region === getTaskData(task)?.[Key.REGION])
            ?.clusters?.map((x) => ({ id: x.name, label: x.name })),
        },
        {
          key: Key.NAMESPACE,
          label: "Namespace",
          inputType: InputTypes.TYPING_DROPDOWN,
          options:
            getCurrentAsset(task, Key.REGION, "region")?.clusters?.length > 0
              ? getCurrentAsset(
                  task,
                  Key.REGION,
                  "region",
                )?.clusters[0].namespaces?.map((el) => {
                  return { id: el.name, label: el.name };
                })
              : [],
        },
      ],
    ],
  };
};
