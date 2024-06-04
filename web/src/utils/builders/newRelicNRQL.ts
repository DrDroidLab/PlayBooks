import { setNRQLData } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import { OptionType } from "../playbooksData.ts";

export const newRelicNRQLBuilder = (task, index) => {
  return {
    builder: [
      [
        {
          key: "metric_name",
          label: "Metric Name",
          type: OptionType.TEXT,
          selected: task?.nrqlData?.metric_name,
          handleChange: (val) => {
            store.dispatch(
              setNRQLData({ index, key: "metric_name", value: val }),
            );
          },
        },
      ],
      [
        {
          key: "unit",
          label: "Unit",
          type: OptionType.TEXT,
          selected: task?.nrqlData?.unit,
          handleChange: (val) => {
            store.dispatch(setNRQLData({ index, key: "unit", value: val }));
          },
        },
      ],
      [
        {
          key: "nrql_expression",
          label: "NRQL Expression",
          type: OptionType.MULTILINE,
          value: task.nrqlData?.nrql_expression,
          handleChange: (e) => {
            const val = e.target.value;
            store.dispatch(
              setNRQLData({ index, key: "nrql_expression", value: val }),
            );
          },
        },
      ],
    ],
  };
};
