import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";

export const cloudwatchMetrics = (key: KeyType, task: Task): any[] => {
  switch (key) {
    case Key.NAMESPACE:
      return getCurrentAsset(task, undefined, undefined, {
        idValue: "namespace",
        labelValue: "namespace",
      });
    case Key.REGION:
      return getCurrentAsset(
        task,
        Key.NAMESPACE,
        "namespace",
        undefined,
        "region_dimension_map",
      ).map((e: any) => {
        return {
          id: e.region,
          label: e.region,
        };
      });
    default:
      return [];
  }
};
