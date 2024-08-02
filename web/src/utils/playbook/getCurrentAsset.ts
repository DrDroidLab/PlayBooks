import { Task } from "../../types/index.ts";
import { KeyType } from "./key.ts";
import { getTaskData } from "./task/getTaskData.ts";

type GetCurrentAssetOptions = {
  idValue: string;
  labelValue: string;
};

export const getCurrentAsset = (
  task: Task,
  key?: KeyType,
  assetKey?: string,
  options?: GetCurrentAssetOptions,
  returnKey: string = "",
): any[] => {
  if (!assetKey && options) {
    return task?.ui_requirement.assets?.map((asset: any) => ({
      id: asset[options?.idValue],
      label: asset[options?.labelValue],
    }));
  }

  if (!assetKey || !key) {
    return [];
  }

  const currentAsset = task?.ui_requirement.assets?.find(
    (e: any) => e[assetKey] === getTaskData(task)?.[key],
  );

  return currentAsset?.[returnKey] ?? [];
};
