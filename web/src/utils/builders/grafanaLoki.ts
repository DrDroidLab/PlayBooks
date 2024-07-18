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
          inputType: InputTypes.MULTILINE,
        },
      ],
      [
        {
          key: Key.LIMIT,
          label: "Limit",
          inputType: InputTypes.TEXT,
          default: 10,
        },
      ],
      [
        {
          key: Key.START_TIME,
          label: "Start time",
          inputType: InputTypes.TEXT,
          default: Math.floor(store.getState().timeRange.startTime),
        },
        {
          key: Key.END_TIME,
          label: "End time",
          inputType: InputTypes.TEXT,
          default: Math.floor(store.getState().timeRange.endTime),
        },
      ],
    ],
  };
};
