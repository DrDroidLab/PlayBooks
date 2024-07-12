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
      [
        {
          key: "timeout",
          label: "Timeout (in seconds)",
          type: OptionType.TEXT_ROW,
          default: '10'
        },
      ],
    ],
  };
};
