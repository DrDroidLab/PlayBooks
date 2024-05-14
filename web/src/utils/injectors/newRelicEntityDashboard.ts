import { PlaybookTask } from "../../types.ts";
import { Step } from "../../types/index.ts";

export const injectNewRelicEntityDashboardTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  const tasks = (step.widget ?? []).map((w) => {
    let metric_task = {
      source: step.source,
      new_relic_task: {
        type: "ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION",
        entity_dashboard_widget_nrql_metric_execution_task: {
          dashboard_guid: step.dashboard?.id,
          dashboard_name: step.dashboard.label,
          page_guid: step.page.page_guid,
          page_name: step.page.page_name,
          widget_id: w.widget_id,
          widget_title: w.widget_title,
          widget_nrql_expression: w.widget_nrql_expression,
          process_function: "timeseries",
        },
      },
    };

    return metric_task;
  });

  return tasks.map((task) => ({
    ...baseTask,
    metric_task: task,
    type: "METRIC",
  }));
};
