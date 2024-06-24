export const NotificationOptionTypes = {
  THREAD_REPLY: "slack_thread_reply",
  SLACK_MESSAGE: "slack_message",
  PAGERDUTY_NOTES: "pagerduty_notes",
  MS_TEAMS_MESSAGE_WEBHOOK: "ms_teams_message_webhook",
} as const;

export type NotificationOptionTypesType =
  (typeof NotificationOptionTypes)[keyof typeof NotificationOptionTypes];
