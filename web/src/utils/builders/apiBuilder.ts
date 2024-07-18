import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

const methodOptions = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const apiBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.METHOD,
          label: "Method",
          type: InputTypes.DROPDOWN,
          options: methodOptions.map((x) => ({ id: x, label: x })),
        },
      ],
      [
        {
          key: Key.URL,
          label: "URL",
          type: InputTypes.TEXT_ROW,
        },
      ],
      [
        {
          key: Key.HEADERS,
          label: "Headers (Enter JSON)",
          type: InputTypes.MULTILINE,
          isOptional: true,
        },
      ],
      [
        {
          key: Key.PAYLOAD,
          label: "Payload/Body (Enter JSON)",
          type: InputTypes.MULTILINE,
          isOptional: true,
        },
      ],
      [
        {
          key: Key.TIMEOUT,
          label: "Timeout (in seconds)",
          type: InputTypes.TEXT_ROW,
        },
      ],
    ],
  };
};
