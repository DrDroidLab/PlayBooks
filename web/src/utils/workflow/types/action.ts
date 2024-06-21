export enum WorkflowActionOptions {
  SLACK_MESSAGE = "slack_message",
  SLACK_THREAD_REPLY = "slack_thread_reply",
  PAGERDUTY_NOTES = "pagerduty_notes",
}

export type WorkflowActionContractType = {
  slack_channel_id?: string;
  pagerduty_incident?: string;
};
