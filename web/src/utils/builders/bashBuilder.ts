import { OptionType } from "../playbooksData.ts";

export const bashBuilder = (options?: any) => {
  return {
    builder: [
      [
        {
          key: "remote_server",
          label: "Remote Server",
          type: OptionType.TYPING_DROPDOWN,
          options: options?.map((x) => ({ id: x, label: x })),
          isOptional: true,
          disabled: true,
          selected: options?.length > 0 ? options[0] : "",
        },
      ],
      [
        {
          key: "command",
          label: "Command",
          type: OptionType.MULTILINE,
        },
      ],
    ],
  };
};
