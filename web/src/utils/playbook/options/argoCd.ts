import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";

export const argoCd = (key: KeyType, task: Task): any[] => {
  const options = getCurrentAsset(task, undefined, undefined, {
    idValue: "name",
    labelValue: "name",
  });
  console.log(options);
  switch (key) {
    case Key.APP_NAME:
      return options;
    default:
      return [];
  }
};
