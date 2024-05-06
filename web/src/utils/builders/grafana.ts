import {
  setDashboard,
  setGrafanaExpression,
  setGrafanaQuery,
  setPanel,
} from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import { OptionType } from "../playbooksData.ts";
import { setGrafanaOptionsFunction } from "../setGrafanaOptionsFunction.ts";

export const grafanaBuilder = (task, index, options: any) => {
  return {
    triggerGetAssetsKey: "panel",
    assetFilterQuery: {
      connector_type: task.source,
      type: task.modelType,
      filters: {
        grafana_target_metric_promql_model_filters: {
          dashboards: [
            {
              dashboard_id: task?.dashboard?.id,
              datasource_uid: task?.dashboard_uid,
              panel_options: [
                {
                  panel_id: task?.panel?.panel_id,
                },
              ],
            },
          ],
        },
      },
    },
    builder: [
      [
        {
          key: "dashboard",
          label: "Dashboard",
          type: OptionType.OPTIONS,
          options: options?.map((e) => {
            return {
              id: e.dashboard_id,
              label: e.dashboard_title,
            };
          }),
          handleChange: (_, val) => {
            store.dispatch(setDashboard({ index, dashboard: val }));
          },
          selected: task.dashboard?.id,
        },
        {
          key: "panel",
          label: "Panel",
          type: OptionType.OPTIONS,
          options: options
            ?.find((e) => e.dashboard_id === task?.dashboard?.id)
            ?.panel_options?.map((panel) => {
              return {
                id: panel.panel_id,
                label: panel.panel_title,
                panel: panel,
              };
            }),
          // requires: ['dashboard'],
          selected: task?.panel?.panel_id,
          handleChange: (_, val) => {
            store.dispatch(setPanel({ index, panel: val.panel }));
          },
        },
        {
          key: "grafanaQuery",
          label: "Query",
          type: OptionType.OPTIONS,
          options:
            task.assets?.panel_promql_map?.length > 0
              ? task.assets?.panel_promql_map[0]?.promql_metrics?.map((e) => {
                  return {
                    id: e.expression,
                    label: e.expression,
                    query: {
                      ...e,
                      originalExpression: e.expression,
                    },
                  };
                })
              : [],
          // requires: ['panel'],
          selected: task?.grafanaQuery?.originalExpression,
          handleChange: (_, val) => {
            store.dispatch(setGrafanaQuery({ index, query: val.query }));
            setGrafanaOptionsFunction(index);
          },
        },
      ],
      [
        {
          label: "Selected Query",
          type: OptionType.MULTILINE,
          value: task?.grafanaQuery?.expression,
          handleChange: (e) => {
            store.dispatch(
              setGrafanaExpression({ index, expression: e.target.value }),
            );
          },
          // requires: ['grafanaQuery']
        },
      ],
    ],
  };
};
