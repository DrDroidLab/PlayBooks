import React from "react";
import { InputTypes } from "../../types/inputs/index.ts";

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
        inputType: InputTypes.TEXT,
        placeholder: "Enter Cron Schedule",
      },
      {
        id: "duration",
        label: "Stop after (in seconds)",
        inputType: InputTypes.TEXT,
        placeholder: "Enter Duration (in seconds)",
        valueType: "LONG",
        length: 200,
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
        inputType: InputTypes.TEXT,
        placeholder: "Enter Interval in seconds",
      },
      {
        id: "duration",
        label: "Stop after (in seconds)",
        inputType: InputTypes.TEXT,
        placeholder: "Enter Duration (in seconds)",
        valueType: "LONG",
        length: 200,
      },
    ],
  },
];
