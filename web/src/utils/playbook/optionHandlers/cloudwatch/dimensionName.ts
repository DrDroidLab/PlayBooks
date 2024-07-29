import { Task } from "../../../../types/index.ts";
import { getCurrentAsset } from "../../getCurrentAsset.ts";
import { Key } from "../../key.ts";
import { getTaskData } from "../../task/getTaskData.ts";

export const getDimensionNames = (task: Task) => {
  const data = getTaskData(task);
  const currentAsset = getCurrentAsset(
    task,
    Key.NAMESPACE,
    "namespace",
    undefined,
    "region_dimension_map",
  );
  const dimensions: any =
    currentAsset.find((el) => el.region === data.region)?.dimensions ?? {};
  const list: any = [];
  for (let [idx, dimension] of Object.entries(dimensions)) {
    list.push({
      id: (dimension as any).name,
      label: (dimension as any).name,
      dimensionIndex: idx,
    });
  }

  return list;
};
