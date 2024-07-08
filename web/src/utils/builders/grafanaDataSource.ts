import { Task } from "../../types/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

const getTaskData = (task: Task) => {
  const source = task.source;
  const taskType = task[source?.toLowerCase()]?.type;

  return task[source?.toLowerCase()][taskType?.toLowerCase()];
};

export const grafanaDataSourceBuilder = (options: any, task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.DATASOURCE_UID,
          label: "Data Source UID",
          type: InputTypes.TYPING_DROPDOWN,
          options: options?.map((e) => {
            return {
              id: e.datasource_uid,
              label: e.datasource_name,
            };
          }),
          helperText: options.find(
            (op) =>
              op.datasource_uid === getTaskData(task)?.[Key.DATASOURCE_UID],
          )?.datasource_name,
        },
      ],
      [
        {
          key: Key.PROMQL_EXPRESSION,
          label: "PromQL",
          type: InputTypes.MULTILINE,
        },
      ],
    ],
  };
};
