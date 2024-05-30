import { SOURCES } from "../../constants/index.ts";

export const extractGrafanaTasks = (step: any) => {
  let stepSource = "GRAFANA";
  let modelType = "GRAFANA_TARGET_METRIC_PROMQL";
  let selected =
    stepSource === SOURCES.GRAFANA_VPC
      ? "GRAFANA_VPC PromQL"
      : "GRAFANA PromQL";
  const tasks = step.tasks;
  const grafanaTask = tasks[0]?.grafana_task;

  const options = {};
  for (let { name, value } of grafanaTask?.promql_metric_execution_task
    ?.promql_label_option_values ?? []) {
    options[name] = value;
  }

  const stepData = {
    modelType,
    source: stepSource,
    selectedSource: selected,
    connector_type: stepSource,
    model_type: modelType,
    type: "METRIC",
    dashboard: {
      id: grafanaTask.promql_metric_execution_task?.dashboard_uid,
      title: grafanaTask.promql_metric_execution_task?.dashboard_title,
    },
    panel: {
      panel_id: grafanaTask.promql_metric_execution_task?.panel_id,
      panel_title: grafanaTask.promql_metric_execution_task?.panel_title,
    },
    grafanaQuery: tasks.map((task) => {
      const grafanaTaskInStep = task?.metric_task?.grafana_task;
      const executionTask = grafanaTaskInStep.promql_metric_execution_task;
      return {
        id: executionTask?.panel_promql_expression,
        label: executionTask?.panel_promql_expression,
        query: {
          expression: executionTask?.promql_expression,
          originalExpression: executionTask?.panel_promql_expression,
        },
      };
    }),
    datasource_uid: grafanaTask.datasource_uid,
    selectedOptions: options,
  };

  return stepData;
};
