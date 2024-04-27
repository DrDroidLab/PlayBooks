export const notificationOptions = [
  {
    id: "notifications",
    type: "multiple-checkbox",
    options: [
      {
        id: "reply-to-alert",
        type: "checkbox",
        group: "notification",
        label: "Get reply to the alert which triggered this workflow",
      },
      {
        id: "slack-message",
        label: "Send via Slack message",
        type: "checkbox",
        group: "notification",
      },
    ],
  },
];
