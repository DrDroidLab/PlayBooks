import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const smtpBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.TO,
          label: "To",
          type: InputTypes.TEXT_ROW,
        },
      ],
      [
        {
          key: Key.SUBJECT,
          label: "Subject",
          type: InputTypes.TEXT_ROW,
        },
      ],
      [
        {
          key: Key.BODY,
          label: "Body",
          type: InputTypes.MULTILINE,
        },
      ],
    ],
  };
};
