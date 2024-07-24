import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Task } from "../../types/index.ts";
import { getTaskData } from "../playbook/getTaskData.ts";
import { Key } from "../playbook/key.ts";
import { getCurrentAsset } from "../playbook/getCurrentAsset.ts";

const getDimensionNames = (task: Task) => {
  const data = getTaskData(task);
  const currentAsset = getCurrentAsset(task, Key.NAMESPACE, "namespace");
  const dimensions: any =
    currentAsset?.region_dimension_map?.find((el) => el.region === data.region)
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

const getDimensionValues = (task: Task) => {
  const data = getTaskData(task);
  const currentAsset = getCurrentAsset(task, Key.NAMESPACE, "namespace");
  const dimensions: any =
    currentAsset?.region_dimension_map?.find((el) => el.region === data.region)
      ?.dimensions ?? {};
  const list: any = [];
  const dimension = Object.values(dimensions)?.find(
    (el: any) => el.name === data.dimensions?.[0]?.name,
  );
  for (let val of (dimension as any)?.values ?? []) {
    list.push({
      id: val,
      label: val,
    });
  }

  return list;
};

const getMetrics = (task: Task) => {
  const data = getTaskData(task);
  const currentAsset = getCurrentAsset(task, Key.NAMESPACE, "namespace");
  return (
    currentAsset?.region_dimension_map
      ?.find((el) => el.region === data.region)
      ?.dimensions?.find((el) => el.name === data.dimensions?.[0]?.name)
      ?.metrics?.map((el) => {
        return {
          id: el,
          label: el,
        };
      }) ?? []
  );
};

export const cloudwatchMetricBuilder = (options: any, task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.NAMESPACE,
          label: "Namespace",
          inputType: InputTypes.TYPING_DROPDOWN,
          options: options?.map((namespace) => {
            return {
              id: namespace,
              label: namespace,
            };
          }),
        },
        {
          key: Key.REGION,
          label: "Region",
          inputType: InputTypes.TYPING_DROPDOWN,
          options: getCurrentAsset(
            task,
            Key.NAMESPACE,
            "namespace",
          )?.region_dimension_map?.map((el) => {
            return { id: el.region, label: el.region };
          }),
        },
        {
          key: Key.DIMENSION_NAME,
          label: "Dimension Name",
          inputType: InputTypes.TYPING_DROPDOWN,
          options: getDimensionNames(task),
        },
        {
          key: Key.DIMENSION_VALUE,
          label: "Dimension Value",
          inputType: InputTypes.TYPING_DROPDOWN,
          options: getDimensionValues(task),
        },
        {
          key: Key.METRIC_NAME,
          label: "Metric",
          placeholder: "Add Metric",
          inputType: InputTypes.TYPING_DROPDOWN_MULTIPLE,
          options: getMetrics(task),
        },
      ],
    ],
  };
};
