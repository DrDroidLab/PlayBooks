import { OptionType } from "../playbooksData.ts";

export const postgresBuilder = (options: any) => {
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
          key: "dbQuery",
          label: "Query",
          type: OptionType.MULTILINE,
        },
      ],
    ],
  };
};
