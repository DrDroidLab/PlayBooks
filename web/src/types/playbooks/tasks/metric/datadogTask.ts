export type ServiceMetricExecutionTask = {
  service_name: string;
  environment_name: string;
  metric: string;
  metric_family: string;
  process_function: string;
};

export type QueryMetricExecutionTask = {
  process_function: string;
  queries: string[];
  formula: string;
};

export type DatadogTask = {
  type: string;
  service_metric_execution_task?: ServiceMetricExecutionTask;
  query_metric_execution_task?: QueryMetricExecutionTask;
};
