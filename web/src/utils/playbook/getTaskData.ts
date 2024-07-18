import { Task } from "../../types/index.ts";

export const getTaskData = (task: Task) => {
  const source = task.source;
  const taskType = task[source?.toLowerCase()]?.type;

  return task[source?.toLowerCase()][taskType?.toLowerCase()];
};
