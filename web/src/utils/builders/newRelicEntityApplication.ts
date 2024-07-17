import { updateCardById } from "../execution/updateCardById.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { Key } from "../playbook/key.ts";
import { Task } from "../../types/index.ts";
import { getCurrentAsset } from "../playbook/getCurrentAsset.ts";

export const newRelicEntityApplicationBuilder = (options: any, task: Task) => {
  const metrics = getCurrentAsset(
    task,
    Key.APPLICATION_NAME,
    "application_name",
  )?.golden_metrics?.map((e) => {
    return {
      id: e.golden_metric_name,
      label: e.golden_metric_name,
      metric: e,
    };
  });
  const source = task.source;
  const taskType = task?.[source.toLowerCase()]?.type;
  const taskKey = `${[source.toLowerCase()]}.${taskType.toLowerCase()}`;
  return {
    builder: [
      [
        {
          key: Key.APPLICATION_NAME,
          label: "Application",
          type: InputTypes.TYPING_DROPDOWN,
          options: options?.map((e) => {
            return {
              id: e.application_name,
              label: e.application_name,
            };
          }),
        },
        {
          key: Key.GOLDEN_METRIC_NAME,
          label: "Metric",
          type: InputTypes.TYPING_DROPDOWN_MULTIPLE,
          options: metrics,
          handleChange: (id: string) => {
            const metric = metrics.find((m) => m.id === id);
            updateCardById(`${taskKey}.${Key.GOLDEN_METRIC_NAME}`, id, task.id);
            updateCardById(
              `${taskKey}.${Key.GOLDEN_METRIC_NRQL_EXPRESSION}`,
              metric.metric[Key.GOLDEN_METRIC_NRQL_EXPRESSION],
              task.id,
            );
            updateCardById(
              `${taskKey}.${Key.GOLDEN_METRIC_UNIT}`,
              metric.metric[Key.GOLDEN_METRIC_UNIT],
              task.id,
            );
          },
        },
        {
          key: Key.GOLDEN_METRIC_UNIT,
          label: "Unit",
          type: InputTypes.TEXT,
          disabled: true,
        },
      ],
      [
        {
          key: Key.GOLDEN_METRIC_NRQL_EXPRESSION,
          label: "Selected Query",
          type: InputTypes.MULTILINE,
          disabled: true,
        },
      ],
    ],
  };
};
