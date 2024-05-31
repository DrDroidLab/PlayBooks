import { store } from "../../store/index.ts";
import { setDatadogMetric } from "../../store/features/playbook/playbookSlice.ts";
import { OptionType } from "../playbooksData.ts";
import getCurrentTask from "../getCurrentTask.ts";

const getCurrentAsset = () => {
  const [task] = getCurrentTask();
  const currentAsset = task?.assets?.find(
    (e) => e.service_name === task?.datadogService,
  );

  return currentAsset;
};

export const datadogBuilder = (options) => {
  const [task, index] = getCurrentTask();
  return {
    triggerGetAssetsKey: "datadogMetricFamily",
    assetFilterQuery: {
      datadog_service_model_filters: {
        services: [
          {
            name: task?.datadogService?.name,
            metric_families: [task?.datadogMetricFamily],
          },
        ],
      },
    },
    builder: [
      [
        {
          key: "datadogService",
          label: "Service",
          type: OptionType.TYPING_DROPDOWN,
          options: options?.map((x) => ({
            id: x.name,
            label: x.name,
            service: x,
          })),
          selected: task.datadogService,
        },
        {
          key: "datadogMetricFamily",
          label: "Metric Family",
          type: OptionType.TYPING_DROPDOWN,
          options: options
            ?.find((e) => e.name === task?.datadogService)
            ?.metric_families?.map((x) => ({ id: x, label: x })),
        },
        {
          key: "datadogEnvironment",
          label: "Environment",
          type: OptionType.TYPING_DROPDOWN,
          options: getCurrentAsset()?.environments?.map((e) => {
            return {
              id: e,
              label: e,
            };
          }),
        },
        {
          key: "datadogMetric",
          label: "Metric",
          type: OptionType.MULTI_SELECT,
          options: getCurrentAsset()
            ?.metrics?.filter(
              (e) => e.metric_family === task.datadogMetricFamily,
            )
            ?.map((e) => {
              return {
                id: e.metric,
                label: e.metric,
              };
            }),
          selected: task?.datadogMetric,
          handleChange: (val) => {
            if (val) store.dispatch(setDatadogMetric({ index, metric: val }));
          },
        },
      ],
    ],
  };
};
