import { Sources } from "../../types/sources.ts";
import { Task } from "../../types/task.ts";
import { TaskDetails } from "../../types/taskDetails.ts";
import { KeyType } from "./key.ts";
import { taskTypeOptionMappings } from "./taskTypeOptionMappings.ts";

export default function extractOptions(task: Task, key: KeyType) {
  const source = task.source;
  const taskType = (
    (task as any)[source.toLowerCase() as Sources] as TaskDetails
  ).type;

  const optionsFunction = taskTypeOptionMappings[`${source} ${taskType}`];

  if (optionsFunction) {
    return optionsFunction(key, task);
  }

  return [];
}
