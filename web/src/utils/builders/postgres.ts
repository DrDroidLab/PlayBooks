import { store } from '../../store/index.ts';
import { setDbQuery } from '../../store/features/playbook/playbookSlice.ts';
import { OptionType } from '../playbooksData.ts';

export const postgresBuilder = (task, index, options: any) => {
  return {
    builder: [
      [
        {
          key: 'database',
          label: 'Database',
          type: OptionType.OPTIONS,
          options: options?.map(x => ({ id: x, label: x }))
        }
      ],
      [
        {
          key: 'dbQuery',
          label: 'Query',
          type: OptionType.MULTILINE,
          handleChange: e => {
            store.dispatch(setDbQuery({ index, query: e.target.value }));
          },
          value: task.dbQuery,
          requires: ['database']
        }
      ]
    ]
  };
};
