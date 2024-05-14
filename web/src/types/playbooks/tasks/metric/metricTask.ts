import {
  CloudWatchTask,
  GrafanaTask,
  NewRelicTask,
  DatadogTask,
} from "./index.ts";

export interface MetricTask {
  source: string;
  cloudwatch_task?: CloudWatchTask;
  grafana_task?: GrafanaTask;
  new_relic_task?: NewRelicTask;
  datadog_task?: DatadogTask;
}
