import {
  selectNamespace,
  setDimensionIndex,
  setRegion,
} from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import { OptionType } from "../playbooksData.ts";

const getDimensions = (task) => {
  const dimensions: any =
    task?.assets?.region_dimension_map?.find((el) => el.region === task.region)
      ?.dimensions ?? {};
  const list: any = [];
  for (let [idx, dimension] of Object.entries(dimensions)) {
    for (let val of dimension.values) {
      list.push({
        id: `${dimension.name}: ${val}`,
        label: `${dimension.name}: ${val}`,
        dimensionIndex: idx,
      });
    }
  }

  return list;
};

const getMetrics = (task) => {
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

export const cloudwatchMetricBuilder = (task, index, options) => {
  return {
    triggerGetAssetsKey: "namespaceName",
    assetFilterQuery: {
      connector_type: task.source,
      type: task.modelType,
      filters: {
        cloudwatch_metric_model_filters: {
          namespaces: [task.namespaceName],
        },
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
          selected: task.namespaceName,
          handleChange: (_, val) => {
            store.dispatch(selectNamespace({ index, namespace: val.label }));
          },
        },
        {
          key: "region",
          label: "Region",
          type: OptionType.OPTIONS,
          options: task.assets?.region_dimension_map?.map((el) => {
            return { id: el.region, label: el.region };
          }),
          handleChange: (_, val) => {
            store.dispatch(setRegion({ index, region: val.label }));
          },
          // requires: ['namespaceName']
        },
        {
          key: "dimensionName",
          label: "Dimension",
          type: OptionType.OPTIONS,
          options: getDimensions(task),
          // requires: ['region'],
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
          options: getMetrics(task),
          // requires: ['dimensionName'],
          selected: task?.metric?.id,
        },
      ],
    ],
  };
};
