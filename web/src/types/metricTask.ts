import { CloudWatchTask } from './cloudwatchTask';
import { GrafanaTask } from './grafanaTask';
import { NewRelicTask } from './newRelicTask';

export interface MetricTask {
  source: string;
  cloudwatch_task?: CloudWatchTask;
  grafana_task?: GrafanaTask;
  new_relic_task?: NewRelicTask;
}
