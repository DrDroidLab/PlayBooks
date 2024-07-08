import { Task } from "../../types/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";

const getTaskData = (task: Task) => {
  const source = task.source;
  const taskType = task[source?.toLowerCase()]?.type;

  return task[source?.toLowerCase()][taskType?.toLowerCase()];
};

const getCurrentAsset = (task: Task) => {
  const currentAsset = task?.ui_requirement.assets?.find(
    (e) => e.service_name === getTaskData(task)?.datadogService,
  );

  return currentAsset;
};

export const datadogBuilder = (options, task: Task) => {
  return {
    builder: [
      [
        {
          key: Key.SERVICE_NAME,
          label: "Service",
          type: InputTypes.TYPING_DROPDOWN,
          options: options?.map((x) => ({
            id: x.name,
            label: x.name,
            service: x,
          })),
        },
        {
          key: Key.METRIC_FAMILY,
          label: "Metric Family",
          type: InputTypes.TYPING_DROPDOWN,
          options: options
            ?.find((e) => e.name === getTaskData(task)?.datadogService)
            ?.metric_families?.map((x) => ({ id: x, label: x })),
        },
        {
          key: Key.ENVIRONMENT_NAME,
          label: "Environment",
          type: InputTypes.TYPING_DROPDOWN,
          options: getCurrentAsset(task)?.environments?.map((e) => {
            return {
              id: e,
              label: e,
            };
          }),
        },
        {
          key: Key.METRIC,
          label: "Metric",
          type: InputTypes.TYPING_DROPDOWN_MULTIPLE,
          options: getCurrentAsset(task)
            ?.metrics?.filter(
              (e) => e.metric_family === getTaskData(task).datadogMetricFamily,
            )
            ?.map((e) => {
              return {
                id: e.metric,
                label: e.metric,
              };
            }),
        },
      ],
    ],
  };
};
