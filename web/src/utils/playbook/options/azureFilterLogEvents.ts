import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";

export const azureFilterLogEvents = (key: KeyType, task: Task): any[] => {
  switch (key) {
    case Key.WORKSPACE_ID:
      return getCurrentAsset(task, undefined, undefined, {
        idValue: "workspace",
        labelValue: "name",
      });
    default:
      return [];
  }
};
