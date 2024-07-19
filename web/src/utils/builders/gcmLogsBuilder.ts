import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const gcmLogsBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.FILTER_QUERY,
          label: "Filter Query",
          type: InputTypes.MULTILINE,
        },
      ],
    ],
  };
};
