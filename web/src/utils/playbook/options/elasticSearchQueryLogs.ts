import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";

export const elasticSearchQueryLogs = (key: KeyType, task: Task): any[] => {
  switch (key) {
    case Key.REMOTE_SERVER:
      return getCurrentAsset(task, undefined, undefined, {
        idValue: "index",
        labelValue: "index",
      });
    default:
      return [];
  }
};
