import { PlaybookTask, Step } from "../../types/index.ts";

export const injectGrafanaTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  const options: any = [];
  if (step.selectedOptions) {
    for (let [key, val] of Object.entries(step.selectedOptions)) {
      options.push({
        name: key,
        value: val,
      });
    }
  }
  const tasks = step.grafanaQuery?.map((e) => {
    let metric_task = {
      source: step.source.toUpperCase(),
      grafana_task: {
        type: "PROMQL_METRIC_EXECUTION",
        datasource_uid:
          step.assets?.panel_promql_map?.length > 0
            ? step.assets.panel_promql_map[0].promql_metrics[0].datasource_uid
            : "",
        promql_metric_execution_task: {
          promql_expression: e.expression,
          panel_promql_expression: e?.originalExpression,
          process_function: "timeseries",
          promql_label_option_values: [],
          panel_id: step.panel.panel_id,
          panel_title: step.panel.panel_title,
          dashboard_uid: step.dashboard.id,
          dashboard_title: step.dashboard.label,
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
