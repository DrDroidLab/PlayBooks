import { store } from '../../store/index.ts';
import {
  setAzureLogQuery,
  setTimespan,
  setWorkspaceId
} from '../../store/features/playbook/playbookSlice.ts';
import { OptionType } from '../playbooksData.ts';

export const azureLogsBuilder = (task, index, options: any) => {
  return {
    builder: [
      [
        {
          key: 'workspace',
          label: 'Workspace',
          type: OptionType.OPTIONS,
          options: options?.map(op => {
            return {
              id: op,
              label: op
            };
          }),
          selected: task.workspaceId,
          handleChange: (_, val) => {
            store.dispatch(setWorkspaceId({ index, workspaceId: val.id }));
          }
        }
      ],
      [
        {
          key: 'filter_query',
          label: 'Log Filter Query',
          type: OptionType.MULTILINE,
          handleChange: e => {
            store.dispatch(setAzureLogQuery({ index, filterQuery: e.target.value }));
          }
        },
        {
            key: 'timespan',
            label: 'Timespan (hours)',
            type: OptionType.TEXT_ROW,
            handleChange: (val) => {
              store.dispatch(setTimespan({ index, timespan: val }));
            }
          }
      ]
    ]
  };
};
