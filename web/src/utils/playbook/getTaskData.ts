import { Task, TaskDetails } from "../../types/index.ts";
import { Sources } from "../../types/playbooks/sources.ts";

export const getTaskData = (task: Task) => {
  const source = task.source;
  const taskType = (
    (task as any)[source?.toLowerCase() as Sources] as TaskDetails
  ).type;

  return ((task as any)[source?.toLowerCase() as Sources] as any)[
    taskType?.toLowerCase()
  ];
};
