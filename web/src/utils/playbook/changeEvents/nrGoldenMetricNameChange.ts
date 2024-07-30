import { Task } from "../../../types";
import { updateCardById } from "../../execution/updateCardById";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key } from "../key.ts";

function nrGoldenMetricNameChange(task: Task) {
  const source = task.source;
  const taskType = (task as any)[source.toLowerCase()]?.type;
  const taskKey = `${[source.toLowerCase()]}.${taskType.toLowerCase()}`;
  const metrics = getCurrentAsset(
    task,
    Key.APPLICATION_ENTITY_NAME,
    "application_name",
    undefined,
    "golden_metrics",
  );

  const handleChange = (val: any) => {
    updateCardById(`${taskKey}.${Key.GOLDEN_METRIC_NAME}`, val, task.id);
    const metric = metrics?.find((m) => m.golden_metric_name === val);

    if (!metric) return;

    updateCardById(
      `${taskKey}.${Key.GOLDEN_METRIC_NRQL_EXPRESSION}`,
      metric?.[Key.GOLDEN_METRIC_NRQL_EXPRESSION],
      task.id,
    );
    updateCardById(
      `${taskKey}.${Key.GOLDEN_METRIC_UNIT}`,
      metric?.[Key.GOLDEN_METRIC_UNIT],
      task.id,
    );
  };

  return handleChange;
}

export default nrGoldenMetricNameChange;
