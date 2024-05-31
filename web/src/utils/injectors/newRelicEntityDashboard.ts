import { PlaybookTask, Step } from "../../types.ts";

export const injectNewRelicEntityDashboardTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  const tasks = (step.widget ?? []).map((w) => ({
    dashboard_guid: step.dashboard?.id,
    dashboard_name: step.dashboard.label,
    page_guid: step.page.page_guid,
    page_name: step.page.page_name,
    widget_id: w.widget?.widget_id,
    widget_title: w.widget?.widget_title,
    widget_nrql_expression: w.widget?.widget_nrql_expression,
    process_function: "timeseries",
  }));

  return tasks.map((task) => ({
    ...baseTask,
    [step.source?.toLowerCase()]: {
      type: step.taskType,
      [(step.taskType ?? "").toLowerCase()]: task,
    },
    type: "METRIC",
  }));
};
