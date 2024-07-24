import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";

export const gke = (key: KeyType, task: Task): any[] => {
  const options = getCurrentAsset(task, undefined, undefined, {
    idValue: "zone",
    labelValue: "zone",
  });
  switch (key) {
    case Key.REGION:
      return options;
    case Key.CLUSTER:
      return getCurrentAsset(
        task,
        Key.ZONE,
        "zone",
        undefined,
        "clusters",
      )?.map((e: any) => ({ id: e.name, label: e.name }));
    case Key.NAMESPACE:
      return getCurrentAsset(
        task,
        Key.ZONE,
        "zone",
        undefined,
        "clusters",
      )?.[0]?.namespaces?.map((e: any) => {
        return {
          id: e.name,
          label: e.name,
        };
      });
    default:
      return [];
  }
};
