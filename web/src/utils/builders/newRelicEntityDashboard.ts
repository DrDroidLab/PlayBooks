import { Task } from "../../types/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { updateCardById } from "../execution/updateCardById.ts";
import { getTaskData } from "../playbook/getTaskData.ts";
import { Key } from "../playbook/key.ts";

const getCurrentAsset = (task) => {
  const currentAsset = task?.assets?.find(
    (e) => e.dashboard_guid === task?.dashboard?.id,
  );

  return currentAsset;
};

export const newRelicEntityDashboardBuilder = (
  options: any,
  task: Task,
  id: string,
) => {
  const widgetOptions =
    getCurrentAsset(task)?.pages?.length > 0
      ? getCurrentAsset(task)?.pages[0].widgets?.map((e) => {
          return {
            id: e.widget_id,
            label: e.widget_title || e.widget_nrql_expression,
            widget: e,
          };
        })
      : [];
  const pageOptions = options
    ?.find((e) => e.dashboard_guid === getTaskData(task)?.[Key.DASHBOARD_GUID])
    ?.page_options?.map((page) => {
      return {
        id: page.page_guid,
        label: page.page_name,
      };
    });
  const source = task.source;
  const taskType = task?.[source.toLowerCase()]?.type;
  const taskKey = `${[source.toLowerCase()]}.${taskType.toLowerCase()}`;
  return {
    builder: [
      [
        {
          key: Key.DASHBOARD_GUID,
          label: "Dashboard",
          type: InputTypes.TYPING_DROPDOWN,
          options: options?.map((e) => {
            return {
              id: e.dashboard_guid,
              label: e.dashboard_name,
            };
          }),
          handleChange: (id: string) => {
            const dashboard = options?.find((op) => op.dashboard_guid === id);
            updateCardById(`${taskKey}.${Key.DASHBOARD_GUID}`, id, task.id);
            updateCardById(
              `${taskKey}.${Key.DASHBOARD_NAME}`,
              dashboard.dashboard_name,
              task.id,
            );
          },
          helperText: getTaskData(task)?.[Key.DASHBOARD_NAME],
        },
        {
          key: Key.PAGE_GUID,
          label: "Page",
          type: InputTypes.TYPING_DROPDOWN,
          options: pageOptions,
          handleChange: (id: string) => {
            const page = pageOptions?.find((op) => op.id === id);
            updateCardById(`${taskKey}.${Key.PAGE_GUID}`, id, task.id);
            updateCardById(`${taskKey}.${Key.PAGE_NAME}`, page?.label, task.id);
          },
          helperText: getTaskData(task)?.[Key.PAGE_NAME],
        },
        {
          key: Key.WIDGET_TITLE,
          label: "Widget",
          type: InputTypes.TYPING_DROPDOWN_MULTIPLE,
          options: widgetOptions,
        },
      ],
      [
        {
          key: Key.WIDGET_NRQL_EXPRESSION,
          label: "Selected Query",
          type: InputTypes.MULTILINE,
          disabled: true,
        },
      ],
    ],
  };
};
