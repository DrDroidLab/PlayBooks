import { UPDATE_PLAYBOOK } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

export const playbookApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    updatePlaybook: builder.mutation<any, any>({
      query: playbook => ({
        url: UPDATE_PLAYBOOK,
        body: {
          playbook_id: playbook.id,
          update_playbook_ops: [
            {
              op: 'UPDATE_PLAYBOOK',
              update_playbook: {
                playbook
              }
            }
          ]
        },
        method: 'POST'
      }),
      invalidatesTags: ['Playbooks']
    })
  })
});

export const { useUpdatePlaybookMutation } = playbookApiSlice;
