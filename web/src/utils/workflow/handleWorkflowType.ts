import { store } from "../../store/index.ts";
import { currentWorkflowSelector } from "../../store/features/workflow/workflowSlice.ts";

export enum WorkflowTypeOptions {
  API = "api",
  SLACK_CHANNEL_ALERT = "slack_channel_alert",
}

type WorkflowTypeReturnType = {
  slack_channel_id?: string;
  slack_channel_name?: string;
  slack_alert_type?: string;
  slack_alert_filter_string?: string;
};

export default function handleWorkflowType(
  workflowType: string,
): WorkflowTypeReturnType {
  const workflow: any = currentWorkflowSelector(store.getState());

  switch (workflowType) {
    case WorkflowTypeOptions.API:
      return {};
    case WorkflowTypeOptions.SLACK_CHANNEL_ALERT:
      return {
        slack_channel_id: workflow.trigger?.channel?.channel_id,
        slack_channel_name: workflow.trigger?.channel?.channel_name,
        slack_alert_type: workflow.trigger?.source,
        slack_alert_filter_string: workflow.trigger?.filterString,
      };

    default:
      return {};
  }
}
