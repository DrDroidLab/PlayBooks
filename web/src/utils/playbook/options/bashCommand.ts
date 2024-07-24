import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";

export const bashCommand = (key: KeyType, task: Task): any[] => {
  switch (key) {
    case Key.DATASOURCE_UID:
      return getCurrentAsset(task, undefined, undefined, {
        idValue: "name",
        labelValue: "name",
      });
    default:
      return [];
  }
};
