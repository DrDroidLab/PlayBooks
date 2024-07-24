import { Task } from "../../../types/index.ts";
import {
  guidChange,
  pageGuidChange,
  widgetNRQLExpressionChange,
} from "../changeEvents/nrDashboard/index.ts";
import { Key, KeyType } from "../key.ts";

export const nrDashboard = (key: KeyType, task: Task, value: string): any => {
  switch (key) {
    case Key.DASHBOARD_GUID:
      return guidChange(task, value);
    case Key.PAGE_GUID:
      return pageGuidChange(task, value);
    case Key.WIDGET_NRQL_EXPRESSION:
      return widgetNRQLExpressionChange(task, value);
    default:
      return undefined;
  }
};
