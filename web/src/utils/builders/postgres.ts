import { OptionType } from "../playbooksData.ts";

export const postgresBuilder = (task, id) => {
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
