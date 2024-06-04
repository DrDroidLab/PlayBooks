import getCurrentTask from "../getCurrentTask.ts";
import { OptionType } from "../playbooksData.ts";

const getCurrentAsset = () => {
  const [task] = getCurrentTask();
  const currentAsset = task?.assets?.find(
    (e) => e.namespace === task.namespaceName,
  );

  return currentAsset;
};

const getDimensionNames = () => {
  const [task] = getCurrentTask();
  const currentAsset = getCurrentAsset();
  const dimensions: any =
    currentAsset?.region_dimension_map?.find((el) => el.region === task.region)
      ?.dimensions ?? {};
  const list: any = [];
  for (let [idx, dimension] of Object.entries(dimensions)) {
    list.push({
      id: (dimension as any).name,
      label: (dimension as any).name,
      dimensionIndex: idx,
    });
  }

  return list;
};

const getDimensionValues = () => {
  const [task] = getCurrentTask();
  const currentAsset = getCurrentAsset();
  const dimensions: any =
    currentAsset?.region_dimension_map?.find((el) => el.region === task.region)
      ?.dimensions ?? {};
  const list: any = [];
  const dimension = Object.values(dimensions)?.find(
    (el: any) => el.name === task.dimensionName,
  );
  for (let val of (dimension as any)?.values ?? []) {
    list.push({
      id: val,
      label: val,
    });
  }

  return list;
};

const getMetrics = () => {
  const [task] = getCurrentTask();
  const currentAsset = getCurrentAsset();
  return (
    currentAsset?.region_dimension_map
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
  const [task] = getCurrentTask();
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
          type: OptionType.TYPING_DROPDOWN,
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
          type: OptionType.TYPING_DROPDOWN,
          options: getCurrentAsset()?.region_dimension_map?.map((el) => {
            return { id: el.region, label: el.region };
          }),
        },
        {
          key: "dimensionName",
          label: "Dimension Name",
          type: OptionType.TYPING_DROPDOWN,
          options: getDimensionNames(),
        },
        {
          key: "dimensionValue",
          label: "Dimension Value",
          type: OptionType.TYPING_DROPDOWN,
          options: getDimensionValues(),
        },
        {
          key: "metric",
          label: "Metric",
          placeholder: "Add Metric",
          type: OptionType.MULTI_SELECT,
          options: getMetrics(),
          selected: task?.metric,
        },
      ],
    ],
  };
};
