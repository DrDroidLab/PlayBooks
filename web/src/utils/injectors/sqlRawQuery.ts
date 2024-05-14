import { PlaybookTask } from "../../types.ts";
import { Step } from "../../types/index.ts";

export const injectSqlRawQueryTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let data_fetch_task = {
    source: step.source.toUpperCase(),
    sql_database_connection_data_fetch_task: {
      query: step.query!,
    },
  };

  return [
    {
      ...baseTask,
      type: "DATA_FETCH",
      data_fetch_task,
    },
  ];
};
