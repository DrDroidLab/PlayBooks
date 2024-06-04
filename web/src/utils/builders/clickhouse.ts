import { OptionType } from "../playbooksData.ts";
import getCurrentTask from "../getCurrentTask.ts";

export const clickhouseBuilder = (options: any) => {
  const [task] = getCurrentTask();
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
    ],
  };
};
