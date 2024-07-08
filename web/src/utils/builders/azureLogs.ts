import { Key } from "../playbook/key.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Task } from "../../types/index.ts";
import { getTaskData } from "../playbook/getTaskData.ts";

export const azureLogsBuilder = (options: any, task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.WORKSPACE_ID,
          label: "Workspace ID",
          type: InputTypes.TYPING_DROPDOWN,
          options: options?.map((op) => ({
            id: op.workspace,
            label: `${op.workspace} - ${op.name}`,
          })),
          helperText:
            options?.find(
              (op) => op.workspace === getTaskData(task)?.[Key.WORKSPACE_ID],
            )?.name ?? "",
        },
      ],
      [
        {
          key: Key.FILTER_QUERY,
          label: "Log Filter Query",
          type: InputTypes.MULTILINE,
        },
        {
          key: Key.TIMESPAN,
          label: "Timespan (hours)",
          type: InputTypes.TEXT_ROW,
        },
      ],
    ],
  };
};
