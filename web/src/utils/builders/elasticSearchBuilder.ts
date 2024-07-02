import { OptionType } from "../playbooksData.ts";

export const elasticSearchBuilder = (options: any) => {
  return {
    builder: [
      [
        {
          key: "index",
          label: "Index",
          type: OptionType.TYPING_DROPDOWN,
          options: options?.map((op) => ({
            id: op,
            label: op,
          })),
        },
      ],
      [
        {
          key: "query",
          label: "Query",
          type: OptionType.MULTILINE,
        },
      ],
      [
        {
          key: "size",
          label: "Size",
          type: OptionType.TEXT,
        },
      ],
    ],
  };
};
