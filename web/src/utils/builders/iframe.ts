import { Task } from "../../types/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { LabelPosition } from "../../types/inputs/labelPosition.ts";
import { getTaskData } from "../playbook/getTaskData.ts";
import { Key } from "../playbook/key.ts";

export const iframeBuilder = (task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.IFRAME_URL,
          label: "Iframe URL",
          inputType: InputTypes.TEXT,
          labelPosition: LabelPosition.LEFT,
        },
      ],
      [
        {
          label: "Iframe RENDER",
          inputType: InputTypes.IFRAME_RENDER,
          value: getTaskData(task)?.[Key.IFRAME_URL],
        },
      ],
    ],
  };
};
