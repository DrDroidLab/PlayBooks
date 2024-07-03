import { store } from "../../store/index.ts";
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
          default: Math.floor(store.getState().timeRange.startTime),
        },
        {
          key: "end_time",
          label: "End time",
          type: OptionType.TEXT,
          default: Math.floor(store.getState().timeRange.endTime),
        },
      ],
    ],
  };
};
