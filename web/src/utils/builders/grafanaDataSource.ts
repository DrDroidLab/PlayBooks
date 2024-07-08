import { Task } from "../../types/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { getTaskData } from "../playbook/getTaskData.ts";
import { Key } from "../playbook/key.ts";

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
