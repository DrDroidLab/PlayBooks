import { store } from "../../../store/index.ts";
import * as Injectors from "../../workflow/injectors/index.ts";

export const stateToWorkflow = () => {
  const workflow: any = store.getState().workflows.currentWorkflow;

  const responseBody: any = {
    workflow: {
      id: workflow.id,
      name: workflow.name,
      schedule: {
        type: workflow.schedule?.toUpperCase(),
        [workflow.schedule]: Injectors.handleScheduleInjector(),
      },
      playbooks: [
        {
          id: parseInt(workflow.playbookId, 10),
        },
      ],
      entry_points: [
        {
          type: workflow.workflowType?.toUpperCase(),
          [workflow.workflowType]: Injectors.handleEntryPointsInjector(),
        },
      ],
      actions: workflow.notification
        ? [
            {
              type: workflow.notification?.toUpperCase(),
              [workflow.notification]: Injectors.handleActionsInjector(),
            },
          ]
        : [],
      configuration: {
        generate_summary: workflow?.generateSummary ?? false,
      },
    },
  };

  return responseBody;
};
