import { Task } from "../../types/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { getCurrentAsset } from "../playbook/getCurrentAsset.ts";
import { Key } from "../playbook/key.ts";

export const gcmLogsBuilder = (options: any, task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.REGION,
          label: "Region",
          type: InputTypes.TYPING_DROPDOWN,
          options: options?.map((region) => {
            return {
              id: region,
              label: region,
            };
          }),
        },
        {
          key: Key.LOG_GROUP_NAME,
          label: "Log Group",
          type: InputTypes.TYPING_DROPDOWN,
          options: getCurrentAsset(task, Key.REGION, "region")?.log_groups?.map(
            (e) => {
              return {
                id: e,
                label: e,
              };
            },
          ),
        },
      ],
      [
        {
          key: Key.FILTER_QUERY,
          label: "Log Filter Query",
          type: InputTypes.MULTILINE,
        },
      ],
    ],
  };
};
