import { Key } from "../playbook/key.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Task } from "../../types/index.ts";
import { getTaskData } from "../playbook/getTaskData.ts";
import { LabelPosition } from "../../types/inputs/labelPosition.ts";

export const azureLogsBuilder = (options: any, task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.WORKSPACE_ID,
          label: "Workspace ID",
          inputType: InputTypes.TYPING_DROPDOWN,
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
          inputType: InputTypes.MULTILINE,
        },
        {
          key: Key.TIMESPAN,
          label: "Timespan (hours)",
          inputType: InputTypes.TEXT,
          labelPosition: LabelPosition.LEFT,
        },
      ],
    ],
  };
};
