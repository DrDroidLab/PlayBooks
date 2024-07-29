import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";
import { getTaskData } from "../task/getTaskData.ts";

export const datadogService = (key: KeyType, task: Task): any[] => {
  const assets = task.ui_requirement.assets;
  const options = assets.map((asset: any) => {
    const metricFamilies = asset.metrics?.map(
      (metric: any) => metric.metric_family,
    );
    const uniqueFamilies = [...new Set(metricFamilies)];
    return {
      name: asset.service_name,
      metric_families: uniqueFamilies,
    };
  });
  switch (key) {
    case Key.SERVICE_NAME:
      return options;
    case Key.METRIC_FAMILY:
      return options
        ?.find((e: any) => e.name === getTaskData(task)?.datadogService)
        ?.metric_families?.map((x: any) => ({ id: x, label: x }));
    case Key.ENVIRONMENT_NAME:
      return getCurrentAsset(
        task,
        Key.SERVICE_NAME,
        "service_name",
        undefined,
        "environments",
      ).map((e: any) => {
        return {
          id: e,
          label: e,
        };
      });
    case Key.METRIC:
      return getCurrentAsset(
        task,
        Key.SERVICE_NAME,
        "service_name",
        undefined,
        "metrics",
      )
        .filter(
          (e) => e.metric_family === getTaskData(task).datadogMetricFamily,
        )
        ?.map((e) => {
          return {
            id: e.metric,
            label: e.metric,
          };
        });
    default:
      return [];
  }
};
