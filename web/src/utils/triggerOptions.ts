export const scheduleOptions = [
  {
    id: "run-once",
    label: "Run once",
    options: [],
  },
  {
    id: "run-periodically",
    label: "Run periodically",
    options: [
      {
        id: "cron-schedule",
        label: "Cron Schedule",
      },
      {
        id: "duration",
        label: "Duration",
      },
    ],
  },
  {
    id: "fixed-time",
    label: "Run at a Fixed Time",
    options: [
      {
        id: "timestamp",
        label: "Time of the day",
      },
    ],
  },
];

export const actionOptions = [
  {
    id: "action-slack",
    label: "Receive Summary over Slack",
    options: [
      {
        id: "slack-webhook",
        label: "Slack Webhook URL",
      },
    ],
  },
  {
    id: "action-webhook",
    label: "Receive Execution Summary Page Link in Webhook",
    options: [
      {
        id: "webhook",
        label: "Webhook URL",
      },
    ],
  },
];
