export enum CloudwatchTaskType {
  UNKNOWN = "UNKNOWN",
  METRIC_EXECUTION = "METRIC_EXECUTION",
  FILTER_LOG_EVENTS = "FILTER_LOG_EVENTS",
}

export interface Dimension {
  name: string;
  value: string;
}

export interface MetricExecution {
  namespace: string;
  region: string;
  metric_name: string;
  dimensions: Dimension[];
  statistic: string;
  process_function: string;
}

export interface FilterLogEvents {
  region: string;
  log_group_name: string;
  filter_query: string;
}

export interface CloudwatchBase {
  type: CloudwatchTaskType;
}

export interface CloudwatchMetricExecution extends CloudwatchBase {
  type: CloudwatchTaskType.METRIC_EXECUTION;
  metric_execution: MetricExecution;
}

export interface CloudwatchFilterLogEvents extends CloudwatchBase {
  type: CloudwatchTaskType.FILTER_LOG_EVENTS;
  filter_log_events: FilterLogEvents;
}

export type Cloudwatch = CloudwatchMetricExecution | CloudwatchFilterLogEvents;
