import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { LabelPosition } from "../../types/inputs/labelPosition.ts";
import { Key } from "../playbook/key.ts";

const methodOptions = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const apiBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.METHOD,
          label: "Method",
          inputType: InputTypes.DROPDOWN,
          options: methodOptions.map((x) => ({ id: x, label: x })),
        },
      ],
      [
        {
          key: Key.URL,
          label: "URL",
          inputType: InputTypes.TEXT,
          labelPosition: LabelPosition.LEFT,
        },
      ],
      [
        {
          key: Key.HEADERS,
          label: "Headers (Enter JSON)",
          inputType: InputTypes.MULTILINE,
          isOptional: true,
        },
      ],
      [
        {
          key: Key.PAYLOAD,
          label: "Payload/Body (Enter JSON)",
          inputType: InputTypes.MULTILINE,
          isOptional: true,
        },
      ],
      [
        {
          key: Key.TIMEOUT,
          label: "Timeout (in seconds)",
          inputType: InputTypes.TEXT,
          labelPosition: LabelPosition.LEFT,
        },
      ],
    ],
  };
};
