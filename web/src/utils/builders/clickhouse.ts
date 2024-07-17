import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const clickhouseBuilder = (options: any) => {
  return {
    builder: [
      [
        {
          key: Key.DATABASE,
          label: "Database",
          type: InputTypes.TYPING_DROPDOWN,
          options: options?.map((x) => ({ id: x, label: x })),
        },
      ],
      [
        {
          key: Key.QUERY,
          label: "Query",
          type: InputTypes.MULTILINE,
        },
      ],
      [
        {
          key: Key.TIMEOUT,
          label: "Timeout (in seconds)",
          type: InputTypes.TEXT_ROW,
          default: 10,
        },
      ],
    ],
  };
};
