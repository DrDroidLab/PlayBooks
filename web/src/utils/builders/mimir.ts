import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const mimirBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.PROMQL_EXPRESSION,
          label: "PromQL",
          inputType: InputTypes.MULTILINE,
        },
      ],
    ],
  };
};
