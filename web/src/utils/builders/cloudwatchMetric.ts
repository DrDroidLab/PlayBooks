import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Task } from "../../types/task.ts";
import { Key } from "../playbook/key.ts";

const getTaskData = (task: Task) => {
  const source = task.source;
  const taskType = task[source?.toLowerCase()]?.type;

  return task[source?.toLowerCase()][taskType?.toLowerCase()];
};

const getCurrentAsset = (task: Task) => {
  const data = getTaskData(task);
  const currentAsset = task?.ui_requirement.assets?.find(
    (e) => e.namespace === data.namespace,
  );

  return currentAsset;
};

const getDimensionNames = (task: Task) => {
  const data = getTaskData(task);
  const currentAsset = getCurrentAsset(task);
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
  const currentAsset = getCurrentAsset(task);
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
  const currentAsset = getCurrentAsset(task);
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

export const cloudwatchMetricBuilder = (options, task) => {
  return {
    builder: [
      [
        {
          key: Key.NAMESPACE,
          label: "Namespace",
          type: InputTypes.TYPING_DROPDOWN,
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
          type: InputTypes.TYPING_DROPDOWN,
          options: getCurrentAsset(task)?.region_dimension_map?.map((el) => {
            return { id: el.region, label: el.region };
          }),
        },
        {
          key: Key.DIMENSION_NAME,
          label: "Dimension Name",
          type: InputTypes.TYPING_DROPDOWN,
          options: getDimensionNames(task),
        },
        {
          key: Key.DIMENSION_VALUE,
          label: "Dimension Value",
          type: InputTypes.TYPING_DROPDOWN,
          options: getDimensionValues(task),
        },
        {
          key: Key.METRIC_NAME,
          label: "Metric",
          placeholder: "Add Metric",
          type: InputTypes.TYPING_DROPDOWN_MULTIPLE,
          options: getMetrics(task),
        },
      ],
    ],
  };
};
