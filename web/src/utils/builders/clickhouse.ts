import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { LabelPosition } from "../../types/inputs/labelPosition.ts";
import { Key } from "../playbook/key.ts";

export const clickhouseBuilder = (options: any) => {
  return {
    builder: [
      [
        {
          key: Key.DATABASE,
          label: "Database",
          inputType: InputTypes.TYPING_DROPDOWN,
          options: options?.map((x) => ({ id: x, label: x })),
        },
      ],
      [
        {
          key: Key.QUERY,
          label: "Query",
          inputType: InputTypes.MULTILINE,
        },
      ],
      [
        {
          key: Key.TIMEOUT,
          label: "Timeout (in seconds)",
          type: InputTypes.TEXT,
          labelPosition: LabelPosition.LEFT,
          default: 120,
        },
      ],
    ],
  };
};
