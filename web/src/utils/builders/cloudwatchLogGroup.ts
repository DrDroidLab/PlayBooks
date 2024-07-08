import { Task } from "../../types/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

const getTaskData = (task: Task) => {
  const source = task.source;
  const taskType = task[source?.toLowerCase()]?.type;

  return task[source?.toLowerCase()][taskType?.toLowerCase()];
};

const getCurrentAsset = (task: Task) => {
  const currentAsset = task?.ui_requirement.assets?.find(
    (e) => e.region === getTaskData(task).region,
  );

  return currentAsset;
};

export const cloudwatchLogGroupBuilder = (options: any, task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.REGION,
          label: "Region",
          type: InputTypes.TYPING_DROPDOWN,
          options: options?.map((region) => {
            return {
              id: region,
              label: region,
            };
          }),
        },
        {
          key: Key.LOG_GROUP_NAME,
          label: "Log Group",
          type: InputTypes.TYPING_DROPDOWN,
          options: getCurrentAsset(task)?.log_groups?.map((e) => {
            return {
              id: e,
              label: e,
            };
          }),
        },
      ],
      [
        {
          key: Key.FILTER_QUERY,
          label: "Log Filter Query",
          type: InputTypes.MULTILINE,
        },
      ],
    ],
  };
};
