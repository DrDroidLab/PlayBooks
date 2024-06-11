export const notificationOptions = [
  {
    id: "notifications",
    type: "multiple-checkbox",
    options: [
      {
        id: "SLACK_THREAD_REPLY",
        type: "checkbox",
        group: "notification",
        label: "Get reply to the alert which triggered this workflow",
      },
      {
        id: "SLACK_MESSAGE",
        label: "Send via Slack message",
        type: "checkbox",
        group: "notification",
      },
    ],
  },
];
