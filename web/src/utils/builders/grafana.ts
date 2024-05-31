import {
  setDashboard,
  setGrafanaExpression,
  setGrafanaQuery,
  setPanel,
  updateStep,
} from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import getCurrentTask from "../getCurrentTask.ts";
import { OptionType } from "../playbooksData.ts";
import {
  grafanaOptionsList,
  setGrafanaOptionsFunction,
} from "../setGrafanaOptionsFunction.ts";

const getCurrentAsset = () => {
  const [task] = getCurrentTask();
  const currentAsset = task?.assets?.find(
    (e) => e.dashboard_id === task?.dashboard?.id,
  );

  return currentAsset;
};

export const grafanaBuilder = (options: any) => {
  const [task, index] = getCurrentTask();
  return {
    triggerGetAssetsKey: "panel",
    assetFilterQuery: {
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
    builder: [
      [
        {
          key: "dashboard",
          label: "Dashboard",
          type: OptionType.TYPING_DROPDOWN,
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
          type: OptionType.TYPING_DROPDOWN,
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
          type: OptionType.MULTI_SELECT,
          options:
            getCurrentAsset()?.panel_promql_map?.length > 0
              ? getCurrentAsset()?.panel_promql_map[0]?.promql_metrics?.map(
                  (e) => {
                    return {
                      id: e.expression,
                      label: e.expression,
                      query: {
                        ...e,
                        originalExpression: e.expression,
                      },
                    };
                  },
                )
              : [],
          // requires: ['panel'],
          selected: task?.grafanaQuery,
          handleChange: (val) => {
            console.log("val", val);
            if (task?.grafanaQuery?.length > 0) {
              const options = grafanaOptionsList(index);
              if (options?.length === 0) {
                store.dispatch(
                  setGrafanaQuery({
                    index,
                    query: val.map((e) => e.query ?? e),
                  }),
                );
                setGrafanaOptionsFunction(index);
              } else {
                store.dispatch(
                  updateStep({
                    index,
                    key: "message",
                    value:
                      "This query contains a varible. You cannot select multiple of these queries.",
                  }),
                );
              }
            } else {
              store.dispatch(setGrafanaQuery({ index, query: val }));
              setGrafanaOptionsFunction(index);
            }
          },
        },
      ],
      [
        {
          label: "Selected Query",
          type: OptionType.MULTILINE,
          value:
            task?.grafanaQuery?.length > 0
              ? task?.grafanaQuery[0]?.query?.expression
                ? task?.grafanaQuery[0]?.query?.expression
                : task?.grafanaQuery[0]?.label
              : "",
          handleChange: (e) => {
            store.dispatch(
              setGrafanaExpression({ index, expression: e.target.value }),
            );
          },
          condition: !task?.grafanaQuery || task?.grafanaQuery?.length < 2,
          // requires: ['grafanaQuery']
        },
      ],
    ],
  };
};
