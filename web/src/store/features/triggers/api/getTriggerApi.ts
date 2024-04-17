import { GET_TRIGGER, GET_TRIGGERS } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';
import { setTrigger } from '../triggerSlice.ts';

export const getTriggerApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getPlaybookTrigger: builder.query<number, any>({
      query: playbook_id => ({
        url: GET_TRIGGERS,
        method: 'POST',
        body: {
          playbook: {
            id: playbook_id
          }
        }
      }),
      transformResponse: response => {
        return response?.alert_ops_triggers ?? [];
      }
    }),
    getTrigger: builder.query<number, any>({
      query: triggerId => ({
        url: GET_TRIGGER,
        method: 'POST',
        body: {
          alert_ops_trigger_ids: [triggerId]
        }
      }),
      transformResponse: response => {
        if (response?.alert_ops_triggers.length > 0) {
          return response?.alert_ops_triggers[0];
        }
        return {};
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setTrigger(data));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
      providesTags: ['Triggers']
    })
  })
});

export const { useLazyGetPlaybookTriggerQuery, useLazyGetTriggerQuery } = getTriggerApi;
