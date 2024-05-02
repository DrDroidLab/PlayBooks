import { setActionKey } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import { OptionType } from "../playbooksData.ts";

const methodOptions = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const apiBuilder = (task, index) => {
  return {
    builder: [
      [
        {
          key: "method",
          label: "Method",
          type: OptionType.OPTIONS,
          options: methodOptions.map((x) => ({ id: x, label: x })),
          selected: task.action?.method,
          handleChange: (val) => {
            store.dispatch(setActionKey({ index, key: "method", value: val }));
          },
        },
      ],
      [
        {
          label: "Headers (Enter JSON)",
          type: OptionType.MULTILINE,
          selected: task.action?.headers,
          handleChange: (e) => {
            store.dispatch(
              setActionKey({ index, key: "headers", value: e.target.value }),
            );
          },
        },
      ],
      [
        {
          key: "url",
          label: "URL",
          type: OptionType.TEXT_ROW,
          selected: task.action?.url,
          handleChange: (val) => {
            store.dispatch(setActionKey({ index, key: "url", value: val }));
          },
        },
      ],
      [
        {
          label: "Payload/Body (Enter JSON)",
          type: OptionType.MULTILINE,
          selected: task.action?.payload,
          handleChange: (e) => {
            store.dispatch(
              setActionKey({ index, key: "payload", value: e.target.value }),
            );
          },
        },
      ],
      [
        {
          key: "timeout",
          label: "Timeout",
          type: OptionType.TEXT_ROW,
          selected: task.action?.timeout,
          handleChange: (val) => {
            store.dispatch(setActionKey({ index, key: "timeout", value: val }));
          },
        },
      ],
    ],
  };
};
