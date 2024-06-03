import { PlaybookTask, Step } from "../../types.ts";

export const injectGrafanaDataSourceTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
    
    let metric_task = {
        source: step.source.toUpperCase(),
        grafana_task: {
            type: "PROMETHEUS_DATASOURCE_METRIC_EXECUTION",
            datasource_uid:
                step.datasource.id,
            prometheus_datasource_metric_execution_task: {
                promql_expression: step.grafanaQuery?.expression,
                process_function: "timeseries",
            }
        }
    };

  return [{
    ...baseTask,
    metric_task: metric_task,
    type: "METRIC",
  }];
};
