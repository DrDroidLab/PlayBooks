import { store } from "../../store/index.ts";
import { setCommand } from "../../store/features/playbook/playbookSlice.ts";
import { OptionType } from "../playbooksData.ts";

export const bashBuilder = (task: any, index: number, options?: any) => {
  return {
    builder: [
      [
        {
          key: "remote_server",
          label: "Remote Server",
          type: OptionType.OPTIONS,
          options: options?.map((x) => ({ id: x, label: x })),
          isOptional: true,
        },
      ],
      [
        {
          key: "command",
          label: "Command",
          type: OptionType.MULTILINE,
          handleChange: (e) => {
            store.dispatch(setCommand({ index, command: e.target.value }));
          },
        },
      ],
    ],
  };
};
