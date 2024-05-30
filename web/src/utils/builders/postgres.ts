import { OptionType } from "../playbooksData.ts";

export const postgresBuilder = (options: any) => {
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
        },
      ],
    ],
  };
};
