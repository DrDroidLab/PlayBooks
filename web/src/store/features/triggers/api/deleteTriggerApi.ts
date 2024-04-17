import { DELETE_TRIGGER } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

export const deleteTriggerApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    deleteTrigger: builder.mutation<any, any>({
      query: ({ playbook_id, triggerId }) => ({
        url: DELETE_TRIGGER,
        method: 'POST',
        body: {
          playbook_id,
          update_playbook_ops: [
            {
              op: 'UPDATE_PLAYBOOK_ALERT_OPS_TRIGGER_STATUS',
              update_playbook_alert_ops_trigger_status: {
                alert_ops_trigger_id: triggerId,
                is_active: false
              }
            }
          ]
        }
      }),
      invalidatesTags: ['Triggers']
    })
  })
});

export const { useDeleteTriggerMutation } = deleteTriggerApi;
