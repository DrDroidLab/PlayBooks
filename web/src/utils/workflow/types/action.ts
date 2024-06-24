export enum WorkflowActionOptions {
  SLACK_MESSAGE = "slack_message",
  SLACK_THREAD_REPLY = "slack_thread_reply",
  MS_TEAMS_MESSAGE_WEBHOOK = "ms_teams_message_webhook",
  PAGERDUTY_NOTES = "pagerduty_notes",
}

export type WorkflowActionContractType = {
  slack_channel_id?: string;
  ms_teams_connector_webhook_url?: string;
  pagerduty_incident?: string;
};
