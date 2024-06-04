import {
  setDashboard,
  setPage,
  setWidget,
} from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import getCurrentTask from "../getCurrentTask.ts";
import { OptionType } from "../playbooksData.ts";

const getCurrentAsset = () => {
  const [task] = getCurrentTask();
  const currentAsset = task?.assets?.find(
    (e) => e.dashboard_guid === task?.dashboard?.id,
  );

  return currentAsset;
};

export const newRelicEntityDashboardBuilder = (options) => {
  const [task, index] = getCurrentTask();
  return {
    triggerGetAssetsKey: "page",
    assetFilterQuery: {
      new_relic_entity_dashboard_model_filters: {
        dashboards: [
          {
            dashboard_guid: task?.dashboard?.id,
            dashboard_name: task?.dashboard?.label,
            page_options: [
              {
                page_guid: task?.page?.page_guid,
                page_name: task?.page?.page_name,
              },
            ],
          },
        ],
      },
    },
    builder: [
      [
        {
          key: "dashboard",
          label: "Dashboard",
          type: OptionType.TYPING_DROPDOWN,
          options: options?.map((e) => {
            return {
              id: e.dashboard_guid,
              label: e.dashboard_name,
            };
          }),
          handleChange: (_, val) => {
            store.dispatch(setDashboard({ index, dashboard: val }));
          },
          selected: task?.dashboard?.id,
          helperText: task?.dashboard?.label,
        },
        {
          key: "page",
          label: "Page",
          type: OptionType.TYPING_DROPDOWN,
          options: options
            ?.find((e) => e.dashboard_guid === task?.dashboard?.id)
            ?.page_options?.map((page) => {
              return {
                id: page.page_guid,
                label: page.page_name,
                page,
              };
            }),
          // requires: ['dashboard'],
          selected: task?.page?.page_name,
          handleChange: (_, val) => {
            store.dispatch(setPage({ index, page: val.page }));
          },
        },
        {
          key: "widget",
          label: "Widget",
          type: OptionType.MULTI_SELECT,
          options:
            getCurrentAsset()?.pages?.length > 0
              ? getCurrentAsset()?.pages[0].widgets?.map((e) => {
                  return {
                    id: e.widget_id,
                    label: e.widget_title || e.widget_nrql_expression,
                    widget: e,
                  };
                })
              : [],
          handleChange: (val) => {
            if (val)
              store.dispatch(
                setWidget({
                  index,
                  widget: val,
                }),
              );
          },
          // selected: task?.widget?.widget_id,
        },
      ],
      [
        {
          label: "Selected Query",
          type: OptionType.MULTILINE,
          value: task?.widget
            ? task?.widget[0]?.widget?.widget_nrql_expression
            : "",
          disabled: true,
          condition: !task.widget || task.widget.length < 2,
          // requires: ['widget']
        },
      ],
    ],
  };
};
