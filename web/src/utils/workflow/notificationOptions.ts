import { NotificationOptionTypes } from "./notificationOptionTypes.ts";

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
        id: NotificationOptionTypes.MS_TEAMS_MESSAGE_WEBHOOK,
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
      {
        id: NotificationOptionTypes.SMTP_EMAIL,
        label: "Send an email",
        type: "checkbox",
        group: "notification",
      },
    ],
  },
];
