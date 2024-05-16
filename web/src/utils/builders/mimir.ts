import { store } from '../../store/index.ts';
import { updateStep } from '../../store/features/playbook/playbookSlice.ts';
import { OptionType } from '../playbooksData.ts';

export const mimirBuilder = (task: any, index: number) => {
  return {
    builder: [
      [
        {
          key: 'promql_expression',
          label: 'PromQL',
          type: OptionType.MULTILINE,
          handleChange: e => {
            store.dispatch(updateStep({ index, key: "promql_expression", value: e.target.value }));
          },
          value: task.promql_expression
        }
      ]
    ]
  };
};
