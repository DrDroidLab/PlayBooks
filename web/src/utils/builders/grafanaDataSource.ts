import { updateCardById } from "../execution/updateCardById.ts";
import { OptionType } from "../playbooksData.ts";

export const grafanaDataSourceBuilder = (options: any, task, id: string) => {
  return {
    builder: [
      [
        {
          key: "datasource",
          label: "Data Source UID",
          type: OptionType.TYPING_DROPDOWN,
          options: options?.map((e) => {
            return {
              id: e.datasource_uid,
              label: e.datasource_name,
            };
          }),
          handleChange: (_, val) => {
            updateCardById("datasource", val, id);
            if (!task?.grafanaQuery?.expression) {
              updateCardById("grafanaQuery", { query: { expression: "" } }, id);
            }
          },
          helperText: task.datasource?.label,
          selected: task.datasource?.id,
        },
      ],
      [
        {
          label: "PromQL",
          type: OptionType.MULTILINE,
          value: task?.grafanaQuery?.expression,
          handleChange: (e) => {
            const val = e.target.value;
            updateCardById("grafanaQuery", { expression: val }, id);
          },
          condition: task?.grafanaQuery,
        },
      ],
    ],
  };
};
