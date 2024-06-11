import { store } from "../../../store/index.ts";
import handleSchedule from "../../workflow/handleSchedule.ts";
import handleWorkflowType from "../../workflow/handleWorkflowType.ts";

export const stateToWorkflow = () => {
  const workflow: any = store.getState().workflows.currentWorkflow;

  const responseBody: any = {
    workflow: {
      id: workflow.id,
      name: workflow.name,
      schedule: {
        type: workflow.schedule?.toUpperCase(),
        [workflow.schedule]: handleSchedule(workflow.schedule),
      },
      playbooks: [
        {
          id: parseInt(workflow.playbookId, 10),
        },
      ],
      entry_points: [
        {
          type: workflow.workflowType?.toUpperCase(),
          [workflow.workflowType]: handleWorkflowType(workflow.workflowType),
        },
      ],
      actions: [
        {
          type: workflow.notification,
          slack_message: {
            slack_channel_id:
              workflow?.channel?.channel_id ??
              workflow.trigger?.channel?.channel_id,
          },
        },
      ],
    },
  };

  return responseBody;
};
