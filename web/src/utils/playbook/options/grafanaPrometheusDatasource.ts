import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";

export const grafanaPrometheusDatasource = (
  key: KeyType,
  task: Task,
): any[] => {
  switch (key) {
    case Key.DATASOURCE_UID:
      return getCurrentAsset(task, undefined, undefined, {
        idValue: "datasource_uid",
        labelValue: "datasource_name",
      });
    default:
      return [];
  }
};
