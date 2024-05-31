import { SOURCES } from "../../constants/index.ts";

export const extractGrafanaTasks = (step: any) => {
  let stepSource = "GRAFANA";
  let selected =
    stepSource === SOURCES.GRAFANA_VPC
      ? "GRAFANA_VPC PromQL"
      : "GRAFANA PromQL";
  const tasks = step.tasks;
  const grafanaTask = tasks[0]?.grafana_task;

  let modelType = grafanaTask.type;
  let stepData = {};

  if (modelType === "GRAFANA_TARGET_METRIC_PROMQL") {
    const options = {};
    for (let { name, value } of grafanaTask?.promql_metric_execution_task
      ?.promql_label_option_values ?? []) {
      options[name] = value;
    }

    stepData = {
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
  }

  if (modelType === "PROMETHEUS_DATASOURCE_METRIC_EXECUTION") {
    selected = "GRAFANA Data Sources";
    stepData = {
      modelType: "GRAFANA_PROMETHEUS_DATASOURCE",
      source: stepSource,
      selectedSource: selected,
      connector_type: stepSource,
      model_type: "GRAFANA_PROMETHEUS_DATASOURCE",
      type: "METRIC",
      grafanaQuery: {
        expression:
          tasks && tasks.length
            ? tasks[0].metric_task?.grafana_task
                ?.prometheus_datasource_metric_execution_task?.promql_expression
            : "",
      },
      datasource_uid: grafanaTask.datasource_uid,
      datasource: { id: grafanaTask.datasource_uid },
    };
  }

  return stepData;
};
