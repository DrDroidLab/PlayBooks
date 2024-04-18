export interface NewRelicTask {
  type: string;
  dashboard_widget_nrql_metric_execution_task?: NrqlMetricExecutionTask;
  application_entity_golden_metric_execution_task?: NrApplicationEntityTask;
}

export interface NrqlMetricExecutionTask {
  dashboard_guid: string;
  dashboard_name: string;
  page_guid: string;
  page_name: string;
  widget_id: string;
  widget_title: string;
  widget_nrql_expression: string;
  process_function: string;
}

export interface NrApplicationEntityTask {
  metric_name: string;
  unit: string;
  nrql_expression: string;
  process_function: string;
}
