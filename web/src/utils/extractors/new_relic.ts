import { models } from "../../constants/index.ts";

export const extractNewRelicTasks = (step: any) => {
  let stepSource = "NEW_RELIC";
  let modelType = "";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const newRelicTask =
    tasks[0][stepSource.toLowerCase()][taskType.toLowerCase()];
  const connectorType =
    tasks[0]?.task_connector_sources?.length > 0
      ? tasks[0]?.task_connector_sources[0]?.id
      : "";

  switch (taskType) {
    case "ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION":
      modelType = models.NEW_RELIC_ENTITY_APPLICATION;
      break;
    case "ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION":
      modelType = models.NEW_RELIC_ENTITY_DASHBOARD;
      break;
    case "NRQL_METRIC_EXECUTION":
      modelType = models.NEW_RELIC_NRQL;
      break;
    default:
      break;
  }

  const stepData = {
    source: stepSource,
    connector_type: stepSource,
    taskType,
    modelType,
    connectorType,
    dashboard: {
      id: newRelicTask?.dashboard_guid,
      label: newRelicTask?.dashboard_name,
    },
    golden_metrics: tasks.map(() => {
      return {
        id: newRelicTask?.golden_metric_name,
        label: newRelicTask?.golden_metric_name,
        metric: {
          golden_metric_name: newRelicTask?.golden_metric_name,
          golden_metric_unit: newRelicTask?.golden_metric_unit,
          golden_metric_nrql_expression:
            newRelicTask?.golden_metric_nrql_expression,
        },
      };
    }),
    application_name: newRelicTask?.application_entity_name,
    page: {
      page_guid: newRelicTask?.page_guid,
      page_name: newRelicTask?.page_name,
    },
    widget: tasks.map(() => {
      return {
        id: newRelicTask?.widget_id,
        label: newRelicTask?.widget_nrql_expression,
        widget: {
          widget_id: newRelicTask?.widget_id,
          widget_title: newRelicTask?.widget_title,
          widget_nrql_expression: newRelicTask?.widget_nrql_expression,
        },
      };
    }),
    nrqlData: {
      metric_name: newRelicTask?.metric_name,
      unit: newRelicTask?.unit,
      nrql_expression: newRelicTask?.nrql_expression,
    },
  };

  return stepData;
};
