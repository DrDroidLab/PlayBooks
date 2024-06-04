import { store } from "../../store/index.ts";
import {
  setAzureLogQuery,
  setTimespan,
  setWorkspaceId,
} from "../../store/features/playbook/playbookSlice.ts";
import { OptionType } from "../playbooksData.ts";
import getCurrentTask from "../getCurrentTask.ts";
import { updateCardByIndex } from "../execution/updateCardByIndex.ts";

export const azureLogsBuilder = (options: any) => {
  const [task, index] = getCurrentTask();
  return {
    builder: [
      [
        {
          key: "workspaceId",
          label: "Workspace",
          type: OptionType.TYPING_DROPDOWN,
          options: options?.map((op) => ({
            id: op.workspace,
            label: op.name,
          })),
          selected: task.workspaceName,
          handleChange: (_, val) => {
            store.dispatch(setWorkspaceId({ index, workspaceId: val.id }));
            updateCardByIndex("workspaceName", val.label);
          },
        },
      ],
      [
        {
          key: "filter_query",
          label: "Log Filter Query",
          type: OptionType.MULTILINE,
          handleChange: (e) => {
            store.dispatch(
              setAzureLogQuery({ index, filterQuery: e.target.value }),
            );
          },
        },
        {
          key: "timespan",
          label: "Timespan (hours)",
          type: OptionType.TEXT_ROW,
          handleChange: (val) => {
            store.dispatch(setTimespan({ index, timespan: val }));
          },
        },
      ],
    ],
  };
};
