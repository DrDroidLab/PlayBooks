import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";

export const nrGoldenMetrics = (key: KeyType, task: Task): any[] => {
  const options = getCurrentAsset(task, undefined, undefined, {
    idValue: "application_name",
    labelValue: "application_name",
  });
  switch (key) {
    case Key.APPLICATION_NAME:
      return options;
    case Key.GOLDEN_METRIC_NAME:
      return getCurrentAsset(
        task,
        Key.APPLICATION_NAME,
        "application_name",
        undefined,
        "golden_metrics",
      ).map((e: any) => {
        return {
          id: e.golden_metric_name,
          label: e.golden_metric_name,
        };
      });
    default:
      return [];
  }
};
