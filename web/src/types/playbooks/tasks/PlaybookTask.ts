import {
  DataFetchTask,
  DocumentationTask,
  MetricTask,
  ActionTask,
} from "./index.ts";

export interface PlaybookTask {
  name?: string;
  id?: string;
  type: string;
  description: string;
  metric_task?: MetricTask;
  data_fetch_task?: DataFetchTask;
  documentation_task?: DocumentationTask;
  action_task?: ActionTask;
  global_variable_set?: any;
  interpreter_type?: string;
}
