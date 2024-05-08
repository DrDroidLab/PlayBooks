import {
  setApplicationName,
  setGoldenMetrics,
} from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import { OptionType } from "../playbooksData.ts";

export const newRelicEntityApplicationBuilder = (task, index, options) => {
  return {
    triggerGetAssetsKey: "application_name",
    assetFilterQuery: {
      connector_type: task.source,
      type: task.modelType,
      filters: {
        new_relic_entity_application_model_filters: {
          application_names: [task.application_name],
        },
      },
    },
    builder: [
      [
        {
          key: "application_name",
          label: "Application",
          type: OptionType.OPTIONS,
          options: options?.map((e) => {
            return {
              id: e,
              label: e,
            };
          }),
          selected: task?.application_name,
          handleChange: (_, val) => {
            store.dispatch(
              setApplicationName({ index, application_name: val.label }),
            );
          },
        },
        {
          key: "golden_metric",
          label: "Metric",
          type: OptionType.MULTI_SELECT,
          options: task.assets?.golden_metrics?.map((e) => {
            return {
              id: e.golden_metric_name,
              label: e.golden_metric_name,
              metric: e,
            };
          }),
          handleChange: (val) => {
            if (val) store.dispatch(setGoldenMetrics({ index, metric: val }));
          },
          selectedValuesKey: "golden_metrics",
          // requires: ['application_name'],
          // selected: task?.golden_metric?.golden_metric_name,
        },
        {
          label: "Unit",
          type: OptionType.OPTIONS,
          options: [
            {
              id: task.golden_metric?.golden_metric_unit,
              label: task.golden_metric?.golden_metric_unit,
            },
          ],
          // requires: ['golden_metric'],
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
