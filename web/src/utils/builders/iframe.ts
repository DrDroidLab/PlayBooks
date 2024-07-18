import { Task } from "../../types/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { getTaskData } from "../playbook/getTaskData.ts";
import { Key } from "../playbook/key.ts";

export const iframeBuilder = (task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.IFRAME_URL,
          label: "Iframe URL",
          type: InputTypes.TEXT_ROW,
        },
      ],
      [
        {
          label: "Iframe RENDER",
          type: InputTypes.IFRAME_RENDER,
          value: getTaskData(task)?.[Key.IFRAME_URL],
        },
      ],
    ],
  };
};
