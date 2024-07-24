import * as Types from "../types/index.ts";

export const handleActionsExtractor = (
  type: Types.WorkflowActionOptions,
  workflowAction: Types.WorkflowActionContractType,
) => {
  switch (type) {
    case Types.WorkflowActionOptions.SLACK_MESSAGE:
      return {
        trigger: {},
        channel: {
          channel_id: workflowAction.slack_channel_id,
        },
      };
    case Types.WorkflowActionOptions.SLACK_THREAD_REPLY:
      return {
        channel: {
          channel_id: workflowAction.slack_channel_id,
        },
        trigger: {
          channel: {
            channel_id: workflowAction.slack_channel_id,
          },
        },
      };
    case Types.WorkflowActionOptions.MS_TEAMS_MESSAGE_WEBHOOK:
      return {
        ms_webhook: workflowAction.ms_teams_connector_webhook_url,
        channel: {},
        trigger: {},
      };
    case Types.WorkflowActionOptions.PAGERDUTY_NOTES:
      return {
        channel: {},
        trigger: {},
      };
    case Types.WorkflowActionOptions.SMTP_EMAIL:
      return {
        channel: {},
        trigger: {},
        to_email: workflowAction.to_email,
        subject: workflowAction.subject,
      };
    default:
      return { channel: {}, trigger: {} };
  }
};
