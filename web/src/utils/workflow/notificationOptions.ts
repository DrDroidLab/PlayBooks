export const notificationOptions = [
  {
    id: "notifications",
    type: "multiple-checkbox",
    options: [
      {
        id: "reply-to-alert",
        type: "checkbox",
        group: "notification",
        label:
          "Get reply to the alert which triggered this workflow. (Only works if Trigger type is Slack)",
      },
      {
        id: "slack-webhook",
        label: "Send via Slack webhook",
        type: "checkbox",
        group: "notification",
        options: [
          {
            id: "slack-webhook-url",
            label: "Webhook URL",
            type: "string",
          },
        ],
      },
    ],
  },
];
