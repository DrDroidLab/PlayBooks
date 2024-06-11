import React from "react";

export const scheduleOptions = [
  {
    id: "one_off",
    label: "Run once",
    options: [],
  },
  {
    id: "cron",
    label: "CRON",
    options: [
      {
        id: "cron",
        label: (
          <>
            Cron Schedule (See{" "}
            <a
              href="https://crontab.guru/#*/2_*_*_*_*"
              rel="noreferrer"
              target="_blank"
              className="text-violet-500">
              Docs
            </a>
            )
          </>
        ),
        type: "string",
        placeholder: "Enter Cron Schedule",
        disabledKey: "interval",
      },
      {
        id: "duration",
        label: "Stop after (in seconds)",
        type: "string",
        placeholder: "Enter Duration (in seconds)",
        valueType: "LONG",
        additionalProps: {
          length: 200,
        },
      },
    ],
  },
  {
    id: "interval",
    label: "Regular Intervals",
    options: [
      {
        id: "interval",
        label: "Interval (in seconds)",
        valueType: "LONG",
        type: "string",
        placeholder: "Enter Interval in seconds",
        disabledKey: "cron",
      },
      {
        id: "duration",
        label: "Stop after (in seconds)",
        type: "string",
        placeholder: "Enter Duration (in seconds)",
        valueType: "LONG",
        additionalProps: {
          length: 200,
        },
      },
    ],
  },
];
