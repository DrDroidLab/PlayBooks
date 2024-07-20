import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const postgresBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.DATABASE,
          label: "Database",
          inputType: InputTypes.TEXT,
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
          type: InputTypes.TEXT_ROW,
          default: 120,
        },
      ],
    ],
  };
};
