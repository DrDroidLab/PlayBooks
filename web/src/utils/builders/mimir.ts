import { OptionType } from "../playbooksData.ts";

export const mimirBuilder = () => {
  return {
    builder: [
      [
        {
          key: "promql_expression",
          label: "PromQL",
          type: OptionType.MULTILINE,
        },
      ],
    ],
  };
};
