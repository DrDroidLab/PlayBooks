import { OptionType } from "../playbooksData.ts";
import { updateCardById } from "../execution/updateCardById.ts";

export const azureLogsBuilder = (options: any, task, id: string) => {
  return {
    builder: [
      [
        {
          key: "workspaceId",
          label: "Workspace ID",
          type: OptionType.TYPING_DROPDOWN,
          options: options?.map((op) => ({
            id: op.workspace,
            label: `${op.workspace} - ${op.name}`,
            workspace: op,
          })),
          helperText: task.workspaceName,
          handleChange: (_, val) => {
            updateCardById("workspaceId", val.id, id);
            updateCardById("workspaceName", val.workspace.name, id);
          },
        },
      ],
      [
        {
          key: "filter_query",
          label: "Log Filter Query",
          type: OptionType.MULTILINE,
        },
        {
          key: "timespan",
          label: "Timespan (hours)",
          type: OptionType.TEXT_ROW,
        },
      ],
    ],
  };
};
