import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const documentationBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.CONTENT,
          label: "Content",
          inputType: InputTypes.WYISWYG,
        },
      ],
    ],
  };
};
