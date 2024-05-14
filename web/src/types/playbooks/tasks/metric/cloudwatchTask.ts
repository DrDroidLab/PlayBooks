export type CloudWatchTask = {
  type: string;
  metric_execution_task?: MetricExecutionTask;
  filter_log_events_task?: FilterLogEventsTask;
};

export type MetricExecutionTask = {
  namespace: string;
  metric_name: string;
  region: string;
  process_function: string;
  statistic: string;
  dimensions: Dimension[];
};

export type FilterLogEventsTask = {
  region: string;
  log_group_name: string;
  filter_query: string;
};

export type Dimension = {
  name: string;
  value: string;
};
