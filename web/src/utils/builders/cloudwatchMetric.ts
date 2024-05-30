import { setDimensionIndex } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import getCurrentTask from "../getCurrentTask.ts";
import { OptionType } from "../playbooksData.ts";

const getDimensions = () => {
  const [task] = getCurrentTask();
  const dimensions: any =
    task?.assets?.region_dimension_map?.find((el) => el.region === task.region)
      ?.dimensions ?? {};
  const list: any = [];
  for (let [idx, dimension] of Object.entries(dimensions)) {
    for (let val of (dimension as any).values) {
      list.push({
        id: `${(dimension as any).name}: ${val}`,
        label: `${(dimension as any).name}: ${val}`,
        dimensionIndex: idx,
      });
    }
  }

  return list;
};

const getMetrics = () => {
  const [task] = getCurrentTask();
  return (
    task?.assets?.region_dimension_map
      ?.find((el) => el.region === task.region)
      ?.dimensions?.find((el) => el.name === task.dimensionName)
      ?.metrics?.map((el) => {
        return {
          id: el,
          label: el,
        };
      }) ?? []
  );
};

export const cloudwatchMetricBuilder = (options) => {
  const [task, index] = getCurrentTask();
  return {
    triggerGetAssetsKey: "namespaceName",
    assetFilterQuery: {
      cloudwatch_metric_model_filters: {
        namespaces: [task.namespaceName],
      },
    },
    builder: [
      [
        {
          key: "namespaceName",
          label: "Namespace",
          type: OptionType.OPTIONS,
          options: options?.map((namespace, i) => {
            return {
              id: namespace,
              label: namespace,
            };
          }),
        },
        {
          key: "region",
          label: "Region",
          type: OptionType.OPTIONS,
          options: task.assets?.region_dimension_map?.map((el) => {
            return { id: el.region, label: el.region };
          }),
        },
        {
          key: "dimensionName",
          label: "Dimension",
          type: OptionType.OPTIONS,
          options: getDimensions(),
          handleChange: (_, value) => {
            store.dispatch(
              setDimensionIndex({
                index,
                dimension: value.label,
                dimensionIndex: value.dimensionIndex,
              }),
            );
          },
          selected: task?.dimensionName
            ? `${task?.dimensionName}: ${task?.dimensionValue}`
            : "",
        },
        {
          key: "metric",
          label: "Metric",
          type: OptionType.MULTI_SELECT,
          options: getMetrics(),
          selected: task?.metric?.id,
        },
      ],
    ],
  };
};
