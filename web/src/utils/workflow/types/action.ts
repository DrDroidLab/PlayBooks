export enum WorkflowActionOptions {
  SLACK_MESSAGE = "slack_message",
  SLACK_THREAD_REPLY = "slack_thread_reply",
  MS_TEAMS_MESSAGE_WEBHOOK = "ms_teams_message_webhook",
  PAGERDUTY_NOTES = "pagerduty_notes",
<<<<<<< HEAD
  ROOTLY_TIMELINE_EVENTS = "rootly_timeline_events",
=======
>>>>>>> 6588b2f402ef53f21c3c17e13f67f5e4dcb2e902
  ZENDUTY_NOTES = "zenduty_notes",
  SMTP_EMAIL = "smtp_email",
}

export type WorkflowActionContractType = {
  slack_channel_id?: string;
  ms_teams_connector_webhook_url?: string;
  pagerduty_incident?: string;
  to_email?: string;
  subject?: string;
};
