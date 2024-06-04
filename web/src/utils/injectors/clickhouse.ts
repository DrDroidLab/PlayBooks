import { PlaybookTask, Step } from "../../types.ts";

export const injectClickhouseTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let clickhouse_data_fetch_task = {
    database: step.database!,
    query: step.dbQuery!,
  };

  return [
    {
      ...baseTask,
      source: step.source.toUpperCase(),
      clickhouse_data_fetch_task,
    },
  ];
};
