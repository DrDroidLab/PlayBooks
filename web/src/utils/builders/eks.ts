import { Key } from "../playbook/key.ts";
import { Task } from "../../types/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";

const getTaskData = (task: Task) => {
  const source = task.source;
  const taskType = task[source?.toLowerCase()]?.type;

  return task[source?.toLowerCase()][taskType?.toLowerCase()];
};

const getCurrentAsset = (task: Task) => {
  const currentAsset = task?.ui_requirement.assets?.find(
    (e) => e.region === getTaskData(task)?.[Key.REGION],
  );

  return currentAsset;
};

export const eksBuilder = (options: any, task: Task) => {
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
          key: Key.NAMESPACE,
          label: "Namespace",
          type: InputTypes.TYPING_DROPDOWN,
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
