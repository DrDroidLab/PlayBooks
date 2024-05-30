import { ClickhouseDataFetchTask } from './clickhouseTask';
import { MetricTask } from './metricTask';

export interface PlaybookTask {
  name?: string;
  type: string;
  description: string;
  notes: string;
  metric_task?: MetricTask;
  data_fetch_task?: DataFetchTask;
  documentation_task?: DocumentationTask;
}

export interface DataFetchTask {
  source: string;
  clickhouse_data_fetch_task: ClickhouseDataFetchTask;
}

export interface DocumentationTask {
  type: string;
  documentation: any;
}

export interface IframeTask {
  iframe_url: string;
}
