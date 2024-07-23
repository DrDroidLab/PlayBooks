import { Key } from "../playbook/key.ts";
import { Task } from "../../types/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";

export const kubernetesKubectlBuilder = (task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.COMMAND,
          label: "Kubectl Command",
          inputType: InputTypes.MULTILINE,
        },
      ],
    ],
  };
};
