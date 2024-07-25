import { Task } from "../../../../types/index.ts";
import { updateCardById } from "../../../execution/updateCardById.ts";
import { getCurrentAsset } from "../../getCurrentAsset.ts";
import { Key } from "../../key.ts";

export const pageGuidChange = (task: Task, value: string) => {
  const source = task.source;
  const taskType = (task as any)[source.toLowerCase()]?.type;
  const taskKey = `${[source.toLowerCase()]}.${taskType.toLowerCase()}`;

  const pageOptions = getCurrentAsset(
    task,
    Key.DASHBOARD_GUID,
    "dashboard_guid",
    undefined,
    "page_options",
  ).map((e: any) => {
    return {
      id: e.page_guid,
      label: e.page_name,
    };
  });

  const page = pageOptions?.find((op: any) => op.id === value);
  if (!page) return page;
  updateCardById(`${taskKey}.${Key.PAGE_GUID}`, value, task.id);
  updateCardById(`${taskKey}.${Key.PAGE_NAME}`, page?.label, task.id);
};
