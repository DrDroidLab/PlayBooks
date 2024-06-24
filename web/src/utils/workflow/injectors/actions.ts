import { store } from "../../../store/index.ts";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import * as Types from "../types/index.ts";

export const handleActionsInjector = (): Types.WorkflowActionContractType => {
  const workflow: any = currentWorkflowSelector(store.getState());

  switch (workflow.notification) {
    case Types.WorkflowActionOptions.SLACK_MESSAGE:
      return {
        slack_channel_id:
          workflow?.channel?.channel_id ??
          workflow.trigger?.channel?.channel_id,
      };
    case Types.WorkflowActionOptions.SLACK_THREAD_REPLY:
      return {
        slack_channel_id:
          workflow?.channel?.channel_id ??
          workflow.trigger?.channel?.channel_id,
      };
    case Types.WorkflowActionOptions.MS_TEAMS_MESSAGE_WEBHOOK:
      return {
        ms_teams_connector_webhook_url:
          workflow?.webhook
      };
    default:
      return {};
  }
};
