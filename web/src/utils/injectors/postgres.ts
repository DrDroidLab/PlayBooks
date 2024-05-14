import { PlaybookTask } from "../../types.ts";
import { Step } from "../../types/index.ts";

export const injectPostgresTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let data_fetch_task = {
    source: step.source.toUpperCase(),
    postgres_data_fetch_task: {
      database: step.database!,
      query: step.dbQuery!,
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
