import { Key } from "../playbook/key.ts";
import { OptionType } from "../playbooksData.ts";

export const mimirBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.PROMQL_EXPRESSION,
          label: "PromQL",
          type: OptionType.MULTILINE,
        },
      ],
    ],
  };
};
