import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";

export const cloudwatchLogs = (key: KeyType, task: Task): any[] => {
  switch (key) {
    case Key.REGION:
      return getCurrentAsset(task, undefined, undefined, {
        idValue: "region",
        labelValue: "region",
      });
    case Key.LOG_GROUP_NAME:
      return getCurrentAsset(
        task,
        Key.REGION,
        "region",
        undefined,
        "log_groups",
      ).map((e: any) => {
        return {
          id: e,
          label: e,
        };
      });
    default:
      return [];
  }
};
