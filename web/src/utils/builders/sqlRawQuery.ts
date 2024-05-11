import { OptionType } from "../playbooksData.ts";

export const sqlRawQueryBuilder = (task: any, index: number) => {
  return {
    builder: [
      [
        {
          key: "query",
          label: "Query",
          type: OptionType.MULTILINE,
        },
      ],
    ],
  };
};
