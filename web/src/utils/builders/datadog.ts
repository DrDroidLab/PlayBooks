import { store } from '../../store/index.ts';
import {
  setDataDogEnvironment,
  setDatadogMetric,
  setDatadogMetricFamily,
  setDatadogService
} from '../../store/features/playbook/playbookSlice.ts';
import { OptionType } from '../playbooksData.ts';

export const datadogBuilder = (task, index, options) => {
  return {
    triggerGetAssetsKey: 'datadogMetricFamily',
    assetFilterQuery: {
      connector_type: task.source,
      type: task.modelType,
      filters: {
        datadog_service_model_filters: {
          services: [
            {
              name: task?.datadogService?.name,
              metric_families: [task?.datadogMetricFamily]
            }
          ]
        }
      }
    },
    builder: [
      [
        {
          key: 'datadogService',
          label: 'Service',
          type: OptionType.OPTIONS,
          options: options?.map(x => ({ id: x.name, label: x.name, service: x })),
          selected: task.datadogService?.name,
          handleChange: (_, val) => {
            store.dispatch(setDatadogService({ index, service: val.service }));
          }
        },
        {
          key: 'datadogMetricFamily',
          label: 'Metric Family',
          type: OptionType.OPTIONS,
          options: options
            ?.find(e => e.name === task?.datadogService?.name)
            ?.metric_families?.map(x => ({ id: x, label: x })),
          requires: ['datadogService'],
          selected: task.datadogMetricFamily,
          handleChange: (_, val) => {
            store.dispatch(setDatadogMetricFamily({ index, metric: val.id }));
          }
        },
        {
          key: 'datadogEnvironment',
          label: 'Environment',
          type: OptionType.OPTIONS,
          options: task?.assets?.environments?.map(e => {
            return {
              id: e,
              label: e
            };
          }),
          requires: ['datadogMetricFamily'],
          selected: task?.datadogEnvironment,
          handleChange: (_, val) => {
            store.dispatch(setDataDogEnvironment({ index, environment: val.id }));
          }
        },
        {
          key: 'datadogMetric',
          label: 'Metric',
          type: OptionType.OPTIONS,
          options: task.assets?.metrics
            ?.filter(e => e.metric_family === task.datadogMetricFamily)
            ?.map(e => {
              return {
                id: e.metric,
                label: e.metric
              };
            }),
          requires: ['datadogEnvironment'],
          selected: task?.datadogMetric,
          handleChange: (_, val) => {
            store.dispatch(setDatadogMetric({ index, metric: val.id }));
          }
        }
      ]
    ]
  };
};
