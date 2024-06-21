import { store } from "../../../store/index.ts";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import * as Types from "../types/index.ts";

export const handleEntryPointsInjector =
  (): Types.WorkflowEntryPointContractType => {
    const workflow: any = currentWorkflowSelector(store.getState());

    switch (workflow.workflowType) {
      case Types.WorkflowEntryPointOptions.API:
        return {};
      case Types.WorkflowEntryPointOptions.SLACK_CHANNEL_ALERT:
        return {
          slack_channel_id: workflow.trigger?.channel?.channel_id,
          slack_channel_name: workflow.trigger?.channel?.channel_name,
          slack_alert_type: workflow.trigger?.source,
          slack_alert_filter_string: workflow.trigger?.filterString,
        };
      case Types.WorkflowEntryPointOptions.PAGERDUTY_INCIDENT:
        return {
          service_name: workflow.trigger?.serviceName,
          incident_title: workflow.trigger?.title,
        };

      default:
        return {};
    }
  };
