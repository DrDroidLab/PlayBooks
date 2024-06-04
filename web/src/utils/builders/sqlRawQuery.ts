import { OptionType } from "../playbooksData.ts";

export const sqlRawQueryBuilder = () => {
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
