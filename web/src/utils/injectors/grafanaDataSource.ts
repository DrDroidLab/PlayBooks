import { PlaybookTask, Step } from "../../types.ts";

export const injectGrafanaDataSourceTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let task = {
    datasource_uid: step.datasource?.id ?? step.datasource,
    promql_expression: step.grafanaQuery?.expression,
    process_function: "timeseries",
  };

  return [
    {
      ...baseTask,
      [step.source?.toLowerCase()]: {
        type: step.taskType,
        [(step.taskType ?? "").toLowerCase()]: task,
      },
    },
  ];
};
