import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";

export const nrDashboard = (key: KeyType, task: Task): any[] => {
  const options = getCurrentAsset(task, undefined, undefined, {
    idValue: "dashboard_guid",
    labelValue: "dashboard_name",
  });
  switch (key) {
    case Key.DASHBOARD_GUID:
      return options;
    case Key.PAGE_GUID:
      return getCurrentAsset(
        task,
        Key.DASHBOARD_GUID,
        "dashboard_guid",
        undefined,
        "page_options",
      ).map((e: any) => {
        return {
          id: e.page_guid,
          label: e.page_name,
        };
      });
    case Key.WIDGET_NRQL_EXPRESSION:
      return getCurrentAsset(
        task,
        Key.DASHBOARD_GUID,
        "dashboard_guid",
        undefined,
        "pages",
      )?.[0]?.widgets?.map((e: any) => {
        return {
          id: e.widget_id,
          label: e.widget_title || e.widget_nrql_expression,
          widget: e,
        };
      });
    default:
      return [];
  }
};
