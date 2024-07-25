import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";
import {
  getDimensionNames,
  getDimensionValues,
  getMetrics,
} from "../optionHandlers/index.ts";

export const cloudwatchMetrics = (
  key: KeyType,
  task: Task,
  index: number = 0,
): any[] => {
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
    case Key.DIMENSION_NAME:
      return getDimensionNames(task);
    case Key.DIMENSION_VALUE:
      return getDimensionValues(task, index);
    case Key.METRIC_NAME:
      return getMetrics(task);
    default:
      return [];
  }
};
