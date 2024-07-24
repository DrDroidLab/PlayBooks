import { Task } from "../../../../types/index.ts";
import { updateCardById } from "../../../execution/updateCardById.ts";
import { getCurrentAsset } from "../../getCurrentAsset.ts";
import { Key } from "../../key.ts";

export const widgetNRQLExpressionChange = (task: Task, value: string) => {
  const source = task.source;
  const taskType = (task as any)[source.toLowerCase()]?.type;
  const taskKey = `${[source.toLowerCase()]}.${taskType.toLowerCase()}`;

  const widgetOptions = getCurrentAsset(
    task,
    Key.DASHBOARD_GUID,
    "dashboard_guid",
    undefined,
    "pages",
  )?.[0]?.widgets?.map((e: any) => {
    return {
      id: e.widget_id,
      label: e.widget_title || e.widget_nrql_expression,
      widget: e,
    };
  });

  const widget = widgetOptions?.find((op: any) => op.id === value)?.widget;
  updateCardById(`${taskKey}.${Key.WIDGET_ID}`, widget.widget_id, task.id);
  updateCardById(
    `${taskKey}.${Key.WIDGET_TITLE}`,
    widget.widget_title,
    task.id,
  );
  updateCardById(
    `${taskKey}.${Key.WIDGET_NRQL_EXPRESSION}`,
    widget.widget_nrql_expression,
    task.id,
  );
};
