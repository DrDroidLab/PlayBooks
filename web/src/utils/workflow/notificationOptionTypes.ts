export const NotificationOptionTypes = {
  THREAD_REPLY: "slack_thread_reply",
  SLACK_MESSAGE: "slack_message",
  PAGERDUTY_NOTES: "pagerduty_notes",
  ROOTLY_TIMELINE_EVENTS: "rootly_timeline_events",
  MS_TEAMS_MESSAGE_WEBHOOK: "ms_teams_message_webhook",
  SMTP_EMAIL: "smtp_email",
} as const;

export type NotificationOptionTypesType =
  (typeof NotificationOptionTypes)[keyof typeof NotificationOptionTypes];
