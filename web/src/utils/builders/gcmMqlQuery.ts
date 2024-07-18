import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const gcmMqlQueryBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.MQL_QUERY,
          label: "MQL Query",
          type: InputTypes.MULTILINE,
        },
      ],
    ],
  };
};
