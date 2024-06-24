import getCurrentTask from "../getCurrentTask.ts";
import { getParentIds } from "./getParentIds.ts";

export const extractLogs = (id: string, parentId?: string) => {
  if (parentId) {
    return [findLogs(id, parentId)];
  }

  const parentIds = getParentIds(id);
  const logs = parentIds
    ?.map((parentId: string) => findLogs(id, parentId))
    .filter((log) => log);

  return logs;
};

const findLogs = (id: string, parentId: string) => {
  const [parentStep] = parentId ? getCurrentTask(parentId) : [{}];
  const relationLogs = parentStep?.relationLogs ?? [];
  const log = relationLogs?.find((e) => {
    return e.relation.child.id === id;
  });

  return log;
};
