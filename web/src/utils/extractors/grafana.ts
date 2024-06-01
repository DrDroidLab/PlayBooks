export const extractGrafanaTasks = (step: any) => {
  let stepSource = "GRAFANA";
  let modelType = "";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const grafanaTask =
    tasks[0][stepSource.toLowerCase()][taskType.toLowerCase()];
  const connectorType = tasks[0]?.task_connector_sources[0]?.id;

  switch (taskType) {
    case "PROMQL_METRIC_EXECUTION":
      modelType = "GRAFANA_TARGET_METRIC_PROMQL";
      break;
    case "PROMETHEUS_DATASOURCE_METRIC_EXECUTION":
      modelType = "PROMETHEUS_DATASOURCE_METRIC_EXECUTION";
      break;
  }

  const options = {};
  for (let { name, value } of grafanaTask?.promql_label_option_values ?? []) {
    options[name] = value;
  }

  const stepData = {
    source: stepSource,
    connector_type: stepSource,
    taskType,
    modelType,
    connectorType,
    dashboard: {
      id: grafanaTask?.dashboard_uid,
      title: grafanaTask?.dashboard_title,
    },
    panel: {
      panel_id: grafanaTask?.panel_id,
      panel_title: grafanaTask?.panel_title,
    },
    grafanaQuery: tasks.map((task) => {
      return {
        id: grafanaTask?.panel_promql_expression,
        label: grafanaTask?.panel_promql_expression,
        query: {
          expression: grafanaTask?.promql_expression,
          originalExpression: grafanaTask?.panel_promql_expression,
        },
      };
    }),
    datasource_uid: grafanaTask.datasource_uid,
    selectedOptions: options,
  };

  return stepData;
};
