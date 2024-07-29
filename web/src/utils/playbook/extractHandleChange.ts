import { Sources } from "../../types/playbooks/sources.ts";
import { Task } from "../../types";
import { KeyType } from "./key.ts";
import { taskTypeChangeMapping } from "./taskTypeChangeMapping.ts";

export default function extractHandleChange(
  task: Task,
  key: KeyType,
  value: string,
) {
  const source = task.source;
  const taskType = (task as any)[source.toLowerCase() as Sources].type;

  const changeFunction = taskTypeChangeMapping[`${source} ${taskType}`];

  if (changeFunction) {
    return changeFunction(key, task, value);
  }

  return undefined;
}
