import { Sources, Task, TaskDetails } from "../../../types";

export const getTaskData = (task: Task) => {
  const source = task.source;
  const taskType = (
    (task as any)[source?.toLowerCase() as Sources] as TaskDetails
  ).type;

  return ((task as any)[source?.toLowerCase() as Sources] as any)[
    taskType?.toLowerCase()
  ];
};
