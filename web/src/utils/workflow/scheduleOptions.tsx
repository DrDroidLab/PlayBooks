import React from "react";

export const scheduleOptions = [
  {
    id: "run-once",
    label: "Run once",
    options: [],
  },
  {
    id: "run-schedule",
    label: "Run continuously",
    options: [
      {
        id: "cron-schedule",
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
      },
      {
        id: "stop-after",
        label: "Stop after",
        type: "multi",
        options: [
          {
            id: "duration",
            label: "Duration",
            type: "string",
            placeholder: "Enter Duration",
            additionalProps: {
              length: 200,
            },
          },
          {
            id: "interval",
            label: "Interval",
            type: "dropdown",
            options: [
              {
                id: "minutes",
                label: "Minutes",
              },
              {
                id: "hours",
                label: "Hours",
              },
            ],
            placeholder: "Enter Interval",
          },
        ],
      },
    ],
  },
];
