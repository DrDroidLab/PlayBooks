import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

export const gcmLogsBuilder = () => {
  return {
    builder: [
      [
        {
          key: Key.FILTER_QUERY,
          label: "Filter Query",
          type: InputTypes.MULTILINE,
        },
        {
          key: Key.ORDER_BY,
          label: "Order By",
          type: InputTypes.TEXT,
          isOptional: true,
        },
        {
          key: Key.PAGE_SIZE,
          label: "Page Size",
          type: InputTypes.TEXT,
          default: '2000'
        },
      ],
    ],
  };
};
