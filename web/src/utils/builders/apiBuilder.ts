import { setActionKey } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import { OptionType } from "../playbooksData.ts";

const methodOptions = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const apiBuilder = (task, id) => {
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
            store.dispatch(setActionKey({ id, key: "method", value: val }));
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
            store.dispatch(setActionKey({ id, key: "url", value: val }));
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
              setActionKey({ id, key: "headers", value: e.target.value }),
            );
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
              setActionKey({ id, key: "payload", value: e.target.value }),
            );
          },
        },
      ],
      [
        {
          key: "timeout",
          label: "Timeout (in seconds)",
          type: OptionType.TEXT_ROW,
          selected: task.action?.timeout,
          default: '10',
          handleChange: (val) => {
            store.dispatch(setActionKey({ id, key: "timeout", value: val }));
          },
        },
      ],
    ],
  };
};
