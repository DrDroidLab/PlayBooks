import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const bashBuilder = (options?: any) => {
  return {
    builder: [
      [
        {
          key: Key.REMOTE_SERVER,
          label: "Remote Server",
          inputType: InputTypes.TYPING_DROPDOWN,
          options: options?.map((x) => ({ id: x, label: x })),
          isOptional: true,
        },
      ],
      [
        {
          key: Key.COMMAND,
          label: "Command",
          inputType: InputTypes.MULTILINE,
        },
      ],
    ],
  };
};
