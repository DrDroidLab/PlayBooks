import { rangeSelector } from "../../store/features/timeRange/timeRangeSlice.ts";
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
          default: rangeSelector(store.getState()).time_geq,
        },
        {
          key: Key.END_TIME,
          label: "End time",
          inputType: InputTypes.TEXT,
          default: rangeSelector(store.getState()).time_lt,
        },
      ],
    ],
  };
};
