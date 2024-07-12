import { OptionType } from "../playbooksData.ts";

export const clickhouseBuilder = (options: any, task: any) => {
  return {
    builder: [
      [
        {
          key: "database",
          label: "Database",
          type: OptionType.TYPING_DROPDOWN,
          options: options?.map((x) => ({ id: x, label: x })),
        },
      ],
      [
        {
          key: "dbQuery",
          label: "Query",
          type: OptionType.MULTILINE,
          value: task.dbQuery,
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
