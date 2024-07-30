import { Task } from "../../../../types";
import { updateCardById } from "../../../execution/updateCardById.ts";
import { getCurrentAsset } from "../../getCurrentAsset.ts";
import { Key } from "../../key.ts";

export const guidChange = (task: Task) => {
  const source = task.source;
  const taskType = (task as any)[source.toLowerCase()]?.type;
  const taskKey = `${[source.toLowerCase()]}.${taskType.toLowerCase()}`;

  const options = getCurrentAsset(task, undefined, undefined, {
    idValue: "dashboard_guid",
    labelValue: "dashboard_name",
  });

  const handleChange = (value: string) => {
    updateCardById(`${taskKey}.${Key.DASHBOARD_GUID}`, value, task.id);
    const dashboard = options?.find((op: any) => op.id === value);
    if (!dashboard) return;
    updateCardById(
      `${taskKey}.${Key.DASHBOARD_NAME}`,
      dashboard.label,
      task.id,
    );
  };

  return handleChange;
};
