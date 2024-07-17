import { Task } from "../../types/index.ts";
import { Key } from "../playbook/key.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { getCurrentAsset } from "../playbook/getCurrentAsset.ts";
import { getTaskData } from "../playbook/getTaskData.ts";

export const gkeBuilder = (options: any, task: Task) => {
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
          key: Key.NAMESPACE,
          label: "Namespace",
          type: InputTypes.TYPING_DROPDOWN,
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
