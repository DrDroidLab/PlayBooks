import { Sources } from "../../types/playbooks/sources.ts";
import { Task } from "../../types";
import getCurrentTask from "../getCurrentTask.ts";
import { KeyType } from "./key.ts";
import { taskTypeOptionMappings } from "./taskTypeOptionMappings.ts";

export default function extractOptions(
  key: KeyType,
  taskFromArg?: Task,
  index?: number,
) {
  const [task] = getCurrentTask(taskFromArg?.id);
  if (!task) return [];
  const source = task.source;
  const taskType = (task as any)[source.toLowerCase() as Sources].type;

  const optionsFunction = taskTypeOptionMappings[`${source} ${taskType}`];

  if (optionsFunction) {
    return optionsFunction(key, task, index);
  }

  return [];
}
