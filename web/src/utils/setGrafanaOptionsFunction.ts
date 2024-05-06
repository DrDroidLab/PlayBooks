import { store } from "../store/index.ts";
import { setGrafanaOptions } from "../store/features/playbook/playbookSlice.ts";

export const grafanaOptionsList = (index) => {
  const options: any = [];
  const task = store.getState().playbook.steps[index];
  if (!task) return [];
  const assets = task.assets;
  if (Object.keys(assets ?? {}).length === 0) return [];
  const promqlMetrics = assets.panel_promql_map?.find(
    (e) => e.panel_id === task.panel.panel_id,
  )?.promql_metrics;
  if (!promqlMetrics || promqlMetrics.length === 0) return [];
  let selectedQuery: any = null;
  for (let metric of promqlMetrics) {
    for (let query of task?.grafanaQuery ?? []) {
      if (metric.expression === query.originalExpression) {
        selectedQuery = metric;
        break;
      }
    }
  }

  if (!selectedQuery) return [];

  if (selectedQuery?.label_variable_map?.length > 0) {
    for (let label of selectedQuery.label_variable_map) {
      if (selectedQuery?.variable_values_options?.length > 0) {
        for (let values of selectedQuery.variable_values_options) {
          if (label.variable === values.variable) {
            options.push({
              label,
              variable: label.variable,
              values: values.values,
            });
          }
        }
      } else {
        options.push({
          label,
          variable: label.variable,
        });
      }
    }
  }

  return options;
};

export const setGrafanaOptionsFunction = (index, options = []) => {
  let list = options;
  if (list.length === 0) {
    list = grafanaOptionsList(index);
  }
  store.dispatch(setGrafanaOptions({ index, options: list }));
};
