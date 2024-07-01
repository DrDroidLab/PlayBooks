import { OptionType } from "../playbooksData.ts";

export const grafanaLokiBuilder = () => {
  return {
    builder: [
      [
        {
          key: "query",
          label: "Query",
          type: OptionType.MULTILINE,
        },
      ],
      [
        {
          key: "start_time",
          label: "Start time",
          type: OptionType.TEXT,
        },
        {
          key: "end_time",
          label: "End time",
          type: OptionType.TEXT,
        },
      ],
    ],
  };
};
