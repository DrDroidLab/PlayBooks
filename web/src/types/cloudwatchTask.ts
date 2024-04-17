export interface CloudWatchTask {
  type: string;
  metric_execution_task?: MetricExecutionTask;
  filter_log_events_task?: FilterLogEventsTask;
}

export interface MetricExecutionTask {
  namespace: string;
  metric_name: string;
  region: string;
  process_function: string;
  statistic: string;
  dimensions: Dimension[];
}

export interface FilterLogEventsTask {
  region: string;
  log_group_name: string;
  filter_query: string;
}

export interface Dimension {
  name: string;
  value: string;
}
