import {
  setApplicationName,
  setGoldenMetric
} from '../../store/features/playbook/playbookSlice.ts';
import { store } from '../../store/index.ts';
import { OptionType } from '../playbooksData.ts';

export const newRelicEntityApplicationBuilder = (task, index, options) => {
  return {
    triggerGetAssetsKey: 'application_name',
    assetFilterQuery: {
      connector_type: task.source,
      type: task.modelType,
      filters: {
        new_relic_entity_application_model_filters: {
          application_names: [task.application_name]
        }
      }
    },
    builder: [
      [
        {
          key: 'application_name',
          label: 'Application',
          type: OptionType.OPTIONS,
          options: options?.map(e => {
            return {
              id: e,
              label: e
            };
          }),
          selected: task?.application_name,
          handleChange: (_, val) => {
            store.dispatch(setApplicationName({ index, application_name: val.label }));
          }
        },
        {
          key: 'golden_metric',
          label: 'Metric',
          type: OptionType.OPTIONS,
          options: task.assets?.golden_metrics?.map(e => {
            return {
              id: e.golden_metric_name,
              label: e.golden_metric_name,
              metric: e
            };
          }),
          handleChange: (_, val) => {
            store.dispatch(setGoldenMetric({ index, metric: val.metric }));
          },
          // requires: ['application_name'],
          selected: task?.golden_metric?.golden_metric_name
        },
        {
          label: 'Unit',
          type: OptionType.OPTIONS,
          options: [
            {
              id: task.golden_metric?.golden_metric_unit,
              label: task.golden_metric?.golden_metric_unit
            }
          ],
          // requires: ['golden_metric'],
          disabled: true,
          selected: task?.golden_metric?.golden_metric_unit
        }
      ],
      [
        {
          label: 'Selected Query',
          type: OptionType.MULTILINE,
          value: task?.golden_metric?.golden_metric_nrql_expression,
          // requires: ['golden_metric'],
          disabled: true
        }
      ]
    ]
  };
};
