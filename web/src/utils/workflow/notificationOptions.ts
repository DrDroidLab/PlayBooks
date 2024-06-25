const NotificationOptionTypes = {
  THREAD_REPLY: "slack_thread_reply",
  SLACK_MESSAGE: "slack_message",
  PAGERDUTY_NOTES: "pagerduty_notes",
};

export const notificationOptions = [
  {
    id: "notifications",
    type: "multiple-checkbox",
    options: [
      {
        id: NotificationOptionTypes.THREAD_REPLY,
        type: "checkbox",
        group: "notification",
        label: "Get reply to the alert which triggered this workflow",
      },
      {
        id: NotificationOptionTypes.SLACK_MESSAGE,
        label: "Send via Slack message",
        type: "checkbox",
        group: "notification",
      },
      {
        id: "ms_teams_message_webhook",
        label: "Send via MS Teams Webhook",
        type: "checkbox",
        group: "notification",
      },
      {
        id: NotificationOptionTypes.PAGERDUTY_NOTES,
        label: "Send a note to PagerDuty",
        type: "checkbox",
        group: "notification",
      },
    ],
  },
];
