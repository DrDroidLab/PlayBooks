import { PlaybookTask, Step } from "../../types.ts";

const getCurrentAsset = (task) => {
  const currentAsset = task?.assets?.find(
    (e) => e.dashboard_id === task?.dashboard?.id,
  );

  return currentAsset;
};

export const injectGrafanaPromQLTasks = (
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
  const tasks = step.grafanaQuery?.map((e) => ({
    datasource_uid:
      getCurrentAsset(step)?.panel_promql_map?.length > 0
        ? getCurrentAsset(step)?.panel_promql_map[0].promql_metrics[0]
            .datasource_uid
        : "",
    promql_expression: e.query?.expression
      ? e.query?.expression
      : e.expression ?? e.label,
    panel_promql_expression: e?.query?.originalExpression
      ? e?.query?.originalExpression
      : e?.originalExpression ?? e.label,
    process_function: "timeseries",
    promql_label_option_values: [],
    panel_id: step?.panel?.panel_id ?? step.panel,
    panel_title: step.panel.panel_title ?? step.panel,
    dashboard_uid: step?.dashboard?.id ?? step.dashboard,
    dashboard_title: step?.dashboard?.label ?? step.dashboard,
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
