import { Task } from "../../../types/index.ts";
import {
  guidChange,
  pageGuidChange,
  widgetNRQLExpressionChange,
} from "../changeEvents/nrDashboard/index.ts";
import { Key, KeyType } from "../key.ts";

export const nrDashboard = (key: KeyType, task: Task): any => {
  switch (key) {
    case Key.DASHBOARD_GUID:
      return guidChange(task);
    case Key.PAGE_GUID:
      return pageGuidChange(task);
    case Key.WIDGET_NRQL_EXPRESSION:
      return widgetNRQLExpressionChange(task);
    default:
      return undefined;
  }
};
