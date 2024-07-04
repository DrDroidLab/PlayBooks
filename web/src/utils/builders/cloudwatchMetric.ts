import { OptionType } from "../playbooksData.ts";

const getCurrentAsset = (task) => {
  const currentAsset = task?.assets?.find(
    (e) => e.namespace === task.namespaceName,
  );

  return currentAsset;
};

const getDimensionNames = (task) => {
  const currentAsset = getCurrentAsset(task);
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

const getDimensionValues = (task) => {
  const currentAsset = getCurrentAsset(task);
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

const getMetrics = (task) => {
  const currentAsset = getCurrentAsset(task);
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

export const cloudwatchMetricBuilder = (options, task) => {
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
          options: options?.map((namespace) => {
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
          options: getCurrentAsset(task)?.region_dimension_map?.map((el) => {
            return { id: el.region, label: el.region };
          }),
        },
        {
          key: "dimensionName",
          label: "Dimension Name",
          type: OptionType.TYPING_DROPDOWN,
          options: getDimensionNames(task),
        },
        {
          key: "dimensionValue",
          label: "Dimension Value",
          type: OptionType.TYPING_DROPDOWN,
          options: getDimensionValues(task),
        },
        {
          key: "metric",
          label: "Metric",
          placeholder: "Add Metric",
          type: OptionType.MULTI_SELECT,
          options: getMetrics(task),
          selected: task?.metric,
        },
      ],
    ],
  };
};
