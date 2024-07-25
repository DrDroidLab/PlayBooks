import { Task } from "../../../../types/index.ts";
import { getCurrentAsset } from "../../getCurrentAsset.ts";
import { getTaskData } from "../../getTaskData.ts";
import { Key } from "../../key.ts";

export const getMetrics = (task: Task) => {
  const data = getTaskData(task);
  const currentAsset = getCurrentAsset(
    task,
    Key.NAMESPACE,
    "namespace",
    undefined,
    "region_dimension_map",
  );
  const regions = currentAsset?.find((el) => el.region === data.region);
  const dimensions = data?.dimensions?.map((dimension: any) =>
    regions?.dimensions?.find((el: any) => el.name === dimension.name),
  );
  return dimensions?.flatMap((d: any) =>
    d.metrics?.map((metric: any) => ({
      id: metric,
      label: metric,
    })),
  );
};
