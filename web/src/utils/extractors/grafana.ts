export const extractGrafanaTasks = (step: any) => {
  let stepSource = "GRAFANA";
  let modelType = "";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const grafanaTask =
    tasks[0][stepSource.toLowerCase()][taskType.toLowerCase()];
  const connectorType = (tasks[0]?.task_connector_sources ?? [])[0]?.id;

  switch (taskType) {
    case "PROMQL_METRIC_EXECUTION":
      modelType = "GRAFANA_TARGET_METRIC_PROMQL";
      break;
    case "PROMETHEUS_DATASOURCE_METRIC_EXECUTION":
      modelType = "GRAFANA_PROMETHEUS_DATASOURCE";
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
    datasource: grafanaTask?.datasource_uid,
    grafanaQuery: {
      expression: grafanaTask?.promql_expression,
    },
    selectedOptions: options,
  };

  return stepData;
};
