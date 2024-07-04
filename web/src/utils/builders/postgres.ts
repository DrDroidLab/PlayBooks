import { OptionType } from "../playbooksData.ts";

export const postgresBuilder = () => {
  return {
    builder: [
      [
        {
          key: "database",
          label: "Database",
          type: OptionType.TEXT,
        },
      ],
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
