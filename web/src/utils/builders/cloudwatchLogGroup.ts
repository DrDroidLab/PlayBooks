import { store } from '../../store/index.ts';
import {
  setLogGroup,
  setLogQuery,
  setRegion
} from '../../store/features/playbook/playbookSlice.ts';
import { OptionType } from '../playbooksData.ts';

export const cloudwatchLogGroupBuilder = (task, index, options: any) => {
  return {
    triggerGetAssetsKey: 'region',
    assetFilterQuery: {
      connector_type: task.source,
      type: task.modelType,
      filters: {
        cloudwatch_log_group_model_filters: {
          regions: [task.region]
        }
      }
    },
    builder: [
      [
        {
          key: 'region',
          label: 'Region',
          type: OptionType.OPTIONS,
          options: options?.map(region => {
            return {
              id: region,
              label: region
            };
          }),
          selected: task.region,
          handleChange: (_, val) => {
            store.dispatch(setRegion({ index, region: val.label }));
          }
        },
        {
          key: 'logGroup',
          label: 'Log Group',
          type: OptionType.OPTIONS,
          options: task?.assets?.log_groups?.map(e => {
            return {
              id: e,
              label: e
            };
          }),
          requires: ['region'],
          handleChange: (_, val) => {
            store.dispatch(setLogGroup({ index, logGroup: val.label }));
          },
          selected: task.logGroup
        }
      ],
      [
        {
          key: 'cw_log_query',
          label: 'Log Filter Query',
          type: OptionType.MULTILINE,
          handleChange: e => {
            store.dispatch(setLogQuery({ index, logQuery: e.target.value }));
          },
          requires: ['logGroup']
        }
      ]
    ]
  };
};
