import { Task } from "../../types/index.ts";
import { getTaskData } from "./getTaskData.ts";
import { KeyType } from "./key.ts";

export const getCurrentAsset = (task: Task, key: KeyType, assetKey: string) => {
  const currentAsset = task?.ui_requirement.assets?.find(
    (e) => e[assetKey] === getTaskData(task)?.[key],
  );

  return currentAsset;
};
