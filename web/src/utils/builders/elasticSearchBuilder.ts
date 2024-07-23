import { Key } from "../playbook/key.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";

export const elasticSearchBuilder = (options: any) => {
  return {
    builder: [
      [
        {
          key: Key.INDEX,
          label: "Index",
          inputType: InputTypes.TYPING_DROPDOWN,
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
          inputType: InputTypes.MULTILINE,
        },
      ],
      [
        {
          key: Key.LIMIT,
          label: "Limit",
          inputType: InputTypes.TEXT,
        },
      ],
    ],
  };
};
