import { Task } from "../../../types/index.ts";
import nrGoldenMetricNameChange from "../changeEvents/nrGoldenMetricNameChange.ts";
import { Key, KeyType } from "../key.ts";

export const nrGoldenMetrics = (key: KeyType, task: Task): any => {
  switch (key) {
    case Key.GOLDEN_METRIC_NAME:
      return nrGoldenMetricNameChange(task);
    default:
      return undefined;
  }
};
