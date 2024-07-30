import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";

export const clickhouseSqlQuery = (key: KeyType, task: Task): any[] => {
  switch (key) {
    case Key.DATABASE:
      return getCurrentAsset(task, undefined, undefined, {
        idValue: "database",
        labelValue: "database",
      });
    default:
      return [];
  }
};
