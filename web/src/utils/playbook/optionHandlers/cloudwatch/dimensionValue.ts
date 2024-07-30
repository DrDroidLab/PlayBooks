import { Task } from "../../../../types/index.ts";
import { getCurrentAsset } from "../../getCurrentAsset.ts";
import { Key } from "../../key.ts";
import { getTaskData } from "../../task/getTaskData.ts";

export const getDimensionValues = (task: Task, index: number) => {
  const data = getTaskData(task);
  const currentAsset = getCurrentAsset(
    task,
    Key.NAMESPACE,
    "namespace",
    undefined,
    "region_dimension_map",
  );
  const dimensions: any =
    currentAsset?.find((el) => el.region === data.region)?.dimensions ?? {};
  const list: any = [];
  const dimension = Object.values(dimensions)?.find(
    (el: any) => el.name === data.dimensions?.[index]?.name,
  );
  for (let val of (dimension as any)?.values ?? []) {
    list.push({
      id: val,
      label: val,
    });
  }

  return list;
};
