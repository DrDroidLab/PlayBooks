import { PlaybookTask, Step } from "../../types.ts";

export const injectElasticSearchTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let task = {
    index: step.index!,
    lucene_query: step.query!,
    "limit": step.size ?? 50,
    "offset": 0,
    "sort_desc": "@timestamp",
    "timestamp_field": "@timestamp"
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
