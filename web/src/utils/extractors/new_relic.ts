import { models } from "../../constants/index.ts";

export const extractNewRelicTasks = (step: any) => {
  let stepSource = "NEW_RELIC";
  let selected = "";
  let modelType = "";
  const tasks = step.tasks;
  const newRelicTask = tasks[0]?.new_relic_task;

  switch (newRelicTask.type) {
    case "ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION":
      selected = "NEW_RELIC Entity Application";
      modelType = models.NEW_RELIC_ENTITY_APPLICATION;
      break;
    case "ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION":
      selected = "NEW_RELIC Entity Dashboard";
      modelType = models.NEW_RELIC_ENTITY_DASHBOARD;
      break;
    case "NRQL_METRIC_EXECUTION":
      selected = "NEW_RELIC Raw NRQL";
      modelType = models.NEW_RELIC_NRQL;
      break;
    default:
      break;
  }

  const stepData = {
    source: stepSource,
    selectedSource: selected,
    connector_type: stepSource,
    model_type: modelType,
    modelType,
    dashboard: {
      id: newRelicTask?.entity_dashboard_widget_nrql_metric_execution_task
        ?.dashboard_guid,
      title:
        newRelicTask?.entity_dashboard_widget_nrql_metric_execution_task
          ?.dashboard_name,
    },
    golden_metrics: tasks.map((nrTask) => {
      const nrAppTask =
        nrTask?.metric_task?.new_relic_task
          ?.entity_application_golden_metric_execution_task;
      return {
        id: nrAppTask?.golden_metric_name,
        label: nrAppTask?.golden_metric_name,
        metric: {
          golden_metric_name: nrAppTask?.golden_metric_name,
          golden_metric_unit: nrAppTask?.golden_metric_unit,
          golden_metric_nrql_expression:
            nrAppTask?.golden_metric_nrql_expression,
        },
      };
    }),
    application_name:
      newRelicTask.entity_application_golden_metric_execution_task
        ?.application_entity_name,
    assets: {
      application_entity_guid:
        newRelicTask.entity_application_golden_metric_execution_task
          ?.application_entity_guid,
      application_name:
        newRelicTask.entity_application_golden_metric_execution_task
          ?.application_entity_name,
    },
    page: {
      page_guid:
        newRelicTask?.entity_dashboard_widget_nrql_metric_execution_task
          ?.page_guid,
      page_name:
        newRelicTask?.entity_dashboard_widget_nrql_metric_execution_task
          ?.page_name,
    },
    widget: tasks.map((nrTask) => {
      const nrDashboardTask =
        nrTask?.metric_task?.new_relic_task
          ?.entity_dashboard_widget_nrql_metric_execution_task;
      return {
        id: nrDashboardTask?.widget_id,
        label: nrDashboardTask?.widget_title,
        widget: {
          widget_id: nrDashboardTask?.widget_id,
          widget_title: nrDashboardTask?.widget_title,
          widget_nrql_expression: nrDashboardTask?.widget_nrql_expression,
        },
      };
    }),
    nrqlData: {
      metric_name: newRelicTask?.nrql_metric_execution_task?.metric_name,
      unit: newRelicTask?.nrql_metric_execution_task?.unit,
      nrql_expression:
        newRelicTask?.nrql_metric_execution_task?.nrql_expression,
    },
  };

  return stepData;
};
