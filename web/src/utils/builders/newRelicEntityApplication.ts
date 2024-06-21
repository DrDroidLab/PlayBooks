import { updateCardById } from "../execution/updateCardById.ts";
import getCurrentTask from "../getCurrentTask.ts";
import { OptionType } from "../playbooksData.ts";

const getCurrentAsset = (id: string) => {
  const [task] = getCurrentTask(id);
  if (!Array.isArray(task?.assets)) return [];
  const currentAsset = task?.assets?.find(
    (e) => e.application_name === task?.application_name,
  );

  return currentAsset;
};

export const newRelicEntityApplicationBuilder = (options, task, id) => {
  return {
    triggerGetAssetsKey: "application_name",
    assetFilterQuery: {
      new_relic_entity_application_model_filters: {
        application_names: [task.application_name],
      },
    },
    builder: [
      [
        {
          key: "application_name",
          label: "Application",
          type: OptionType.TYPING_DROPDOWN,
          options: options?.map((e) => {
            return {
              id: e.application_name,
              label: e.application_name,
            };
          }),
        },
        {
          key: "golden_metric",
          label: "Metric",
          type: OptionType.MULTI_SELECT,
          options: getCurrentAsset(id)?.golden_metrics?.map((e) => {
            return {
              id: e.golden_metric_name,
              label: e.golden_metric_name,
              metric: e,
            };
          }),
          selected: task.golden_metrics,
          handleChange: (val) => {
            updateCardById("golden_metrics", val, id);
          },
        },
        {
          label: "Unit",
          type: OptionType.OPTIONS,
          options:
            task?.golden_metrics?.length === 1
              ? [
                  {
                    id: task?.golden_metrics[0]?.metric?.golden_metric_unit,
                    label: task?.golden_metrics[0]?.metric?.golden_metric_unit,
                  },
                ]
              : [],
          disabled: true,
          selected:
            task?.golden_metrics?.length === 1
              ? task?.golden_metrics[0]?.metric?.golden_metric_unit
              : "",
          condition: !task.golden_metrics || task?.golden_metrics?.length < 2,
        },
      ],
      [
        {
          label: "Selected Query",
          type: OptionType.MULTILINE,
          value:
            task?.golden_metrics?.length === 1
              ? task?.golden_metrics[0]?.metric?.golden_metric_nrql_expression
              : "",
          // requires: ['golden_metric'],
          disabled: true,
          condition: !task.golden_metrics || task?.golden_metrics?.length < 2,
        },
      ],
    ],
  };
};
