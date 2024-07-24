import { Task } from "../../../types/task.ts";
import { updateCardById } from "../../execution/updateCardById";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key } from "../key.ts";

function nrGoldenMetricNameChange(task: Task, val: string) {
  const source = task.source;
  const taskType = (task as any)[source.toLowerCase()]?.type;
  const taskKey = `${[source.toLowerCase()]}.${taskType.toLowerCase()}`;
  const metrics = getCurrentAsset(
    task,
    Key.APPLICATION_NAME,
    "application_name",
    undefined,
    "golden_metrics",
  );

  const metric = metrics.find((m) => m.id === val);

  if (!metric) return;

  updateCardById(`${taskKey}.${Key.GOLDEN_METRIC_NAME}`, val, task.id);
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
}

export default nrGoldenMetricNameChange;
