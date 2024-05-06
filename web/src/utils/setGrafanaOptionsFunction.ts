import { store } from "../store/index.ts";
import { setGrafanaOptions } from "../store/features/playbook/playbookSlice.ts";

export const setGrafanaOptionsFunction = (index) => {
  const options: any = [];
  const task = store.getState().playbook.steps[index];
  if (!task) return;
  const assets = task.assets;
  const promqlMetrics = assets.panel_promql_map.find(
    (e) => e.panel_id === task.panel.panel_id,
  ).promql_metrics;
  const selectedQuery = promqlMetrics.find(
    (e) => e.expression === task.grafanaQuery.originalExpression,
  );

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

  store.dispatch(setGrafanaOptions({ index, options }));
};
