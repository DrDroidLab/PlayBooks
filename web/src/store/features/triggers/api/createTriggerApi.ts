import { CREATE_TRIGGER } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

export const createTriggerApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createTrigger: builder.mutation<any, any>({
      query: ({ playbook_id, workspaceId, channel, alert_type, filterString }) => ({
        url: CREATE_TRIGGER,
        method: 'POST',
        body: {
          playbook: {
            id: playbook_id
          },
          alert_ops_triggers: [
            {
              connector: {
                id: workspaceId
              },
              definition: {
                type: 'SLACK_ALERT_PLAYBOOK',
                slack_alert_playbook_trigger: {
                  channel_connector_key_id: channel.id,
                  channel_id: channel.channel_id,
                  channel_name: channel.channel_name,
                  alert_type,
                  alert_title_filter_string: filterString
                }
              }
            }
          ]
        }
      }),
      invalidatesTags: ['Triggers']
    })
  })
});

export const { useCreateTriggerMutation } = createTriggerApi;
