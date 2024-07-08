import { OptionType } from "../playbooksData.ts";
import { Task } from "../../types/index.ts";
import { Key } from "../playbook/key.ts";

const getTaskData = (task: Task) => {
  const source = task.source;
  const taskType = task[source?.toLowerCase()]?.type;

  return task[source?.toLowerCase()][taskType?.toLowerCase()];
};

const getCurrentAsset = (task: Task) => {
  const currentAsset = task?.ui_requirement.assets?.find(
    (e) => e.region === getTaskData(task)?.eksRegion,
  );

  return currentAsset;
};

export const gkeBuilder = (options: any, task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.ZONE,
          label: "Zone",
          type: OptionType.TYPING_DROPDOWN,
          options: options?.map((x) => ({ id: x.zone, label: x.zone })) ?? [],
        },
        {
          key: Key.CLUSTER,
          label: "Cluster",
          type: OptionType.TYPING_DROPDOWN,
          options: options
            ?.find((e) => e.zone === getTaskData(task)?.zone)
            ?.clusters?.map((x) => ({ id: x.name, label: x.name })),
        },
        {
          key: Key.NAMESPACE,
          label: "Namespace",
          type: OptionType.TYPING_DROPDOWN,
          options:
            getCurrentAsset(task)?.clusters?.length > 0
              ? getCurrentAsset(task)?.clusters[0].namespaces?.map((el) => {
                  return { id: el.name, label: el.name };
                })
              : [],
        },
      ],
    ],
  };
};
