import { PlaybookTask, Step } from "../../types.ts";

export const injectSqlRawQueryTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let sql_database_connection_data_fetch_task = {
    query: step.query!,
  };

  return [
    {
      ...baseTask,
      sql_database_connection_data_fetch_task,
    },
  ];
};
