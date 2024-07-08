import { Key } from "../playbook/key.ts";
import { OptionType } from "../playbooksData.ts";

export const bashBuilder = (options?: any) => {
  return {
    builder: [
      [
        {
          key: Key.REMOTE_SERVER,
          label: "Remote Server",
          type: OptionType.TYPING_DROPDOWN,
          options: options?.map((x) => ({ id: x, label: x })),
          isOptional: true,
        },
      ],
      [
        {
          key: Key.COMMAND,
          label: "Command",
          type: OptionType.MULTILINE,
        },
      ],
    ],
  };
};
