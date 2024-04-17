import { DELETE_PLAYBOOK } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

export const deletePlaybookApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    deletePlaybook: builder.mutation<any, number>({
      query: playbookId => ({
        url: DELETE_PLAYBOOK,
        method: 'POST',
        body: {
          playbook_id: playbookId,
          update_playbook_ops: [
            {
              op: 'UPDATE_PLAYBOOK_STATUS',
              update_playbook_status: {
                is_active: false
              }
            }
          ]
        }
      }),
      invalidatesTags: ['Playbooks']
    })
  })
});

export const { useDeletePlaybookMutation } = deletePlaybookApi;
