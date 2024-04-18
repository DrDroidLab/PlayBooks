export interface GrafanaTask {
  type: string;
  datasource_uid: string;
  promql_metric_execution_task: PromqlMetricExecutionTask;
}

export interface PromqlMetricExecutionTask {
  promql_expression: string;
  process_function: string;
  promql_label_option_values: any;
  panel_id: string;
  panel_title: string;
  dashboard_uid: string;
  dashboard_title: string;
}
