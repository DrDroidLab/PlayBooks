import { SEARCH_TRIGGER } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

type SearchTriggerApiArgTypes = {
  workspace_id: number;
  channel_id: number;
  alert_type: string;
  filter_string: string;
};

const currentTimestamp = Math.floor(Date.now() / 1000);

export const searchTriggerApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getSearchTriggers: builder.query<any, SearchTriggerApiArgTypes>({
      query: ({ workspace_id, channel_id, alert_type, filter_string }) => ({
        url: SEARCH_TRIGGER,
        method: 'POST',
        body: {
          meta: {
            page: {
              limit: 5,
              offset: 0
            },
            time_range: {
              time_geq: currentTimestamp - 259200,
              time_lt: currentTimestamp
            }
          },
          workspace_id,
          channel_id,
          alert_type,
          pattern: filter_string
        }
      }),
      transformResponse: (response: any) => {
        const data = {
          alerts: response?.slack_alerts ?? [],
          total: response?.meta?.total_count ?? 0
        };
        return data;
      }
    })
  })
});

export const { useLazyGetSearchTriggersQuery } = searchTriggerApi;
