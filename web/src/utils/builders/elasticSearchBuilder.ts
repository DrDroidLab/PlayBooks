import { Key } from "../playbook/key.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";

export const elasticSearchBuilder = (options: any) => {
  return {
    builder: [
      [
        {
          key: Key.INDEX,
          label: "Index",
          type: InputTypes.TYPING_DROPDOWN,
          options: options?.map((op) => ({
            id: op,
            label: op,
          })),
        },
      ],
      [
        {
          key: Key.LUCENE_QUERY,
          label: "Query",
          type: InputTypes.MULTILINE,
        },
      ],
      [
        {
          key: Key.LIMIT,
          label: "Limit",
          type: InputTypes.TEXT,
        },
      ],
    ],
  };
};
