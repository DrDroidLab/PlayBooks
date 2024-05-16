import { PlaybookTask, Step } from "../../types.ts";

export const injectPostgresTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let postgres_data_fetch_task = {
    database: step.database!,
    query: step.dbQuery!,
  };

  return [
    {
      ...baseTask,
      source: step.source.toUpperCase(),
      postgres_data_fetch_task,
    },
  ];
};
