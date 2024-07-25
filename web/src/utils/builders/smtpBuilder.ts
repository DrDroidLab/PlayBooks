import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const smtpBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.TO,
          label: "To",
          inputType: InputTypes.TEXT,
        },
      ],
      [
        {
          key: Key.SUBJECT,
          label: "Subject",
          inputType: InputTypes.TEXT,
        },
      ],
      [
        {
          key: Key.BODY,
          label: "Body",
          inputType: InputTypes.MULTILINE,
        },
      ],
    ],
  };
};
