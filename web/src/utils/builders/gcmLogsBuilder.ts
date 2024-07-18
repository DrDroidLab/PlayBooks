import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const gcmLogsBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.LOG_NAME,
          label: "Log Name",
          type: InputTypes.TEXT,
        },
        {
          key: Key.FILTER_QUERY,
          label: "Filter Query",
          type: InputTypes.MULTILINE,
        },
      ],
    ],
  };
};
