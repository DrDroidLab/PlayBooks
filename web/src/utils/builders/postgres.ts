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
          key: "dbQuery",
          label: "Query",
          type: OptionType.MULTILINE,
        },
      ],
    ],
  };
};
