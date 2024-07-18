import { store } from "../../store/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const grafanaLokiBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.QUERY,
          label: "Query",
          type: InputTypes.MULTILINE,
        },
      ],
      [
        {
          key: Key.LIMIT,
          label: "Limit",
          type: InputTypes.TEXT,
          default: 10,
        },
      ],
      [
        {
          key: Key.START_TIME,
          label: "Start time",
          type: InputTypes.TEXT,
          default: Math.floor(store.getState().timeRange.startTime),
        },
        {
          key: Key.END_TIME,
          label: "End time",
          type: InputTypes.TEXT,
          default: Math.floor(store.getState().timeRange.endTime),
        },
      ],
    ],
  };
};
