import { GET_MOST_FREQUENT_ALERT_PLAYGROUND } from '../../../../constants/index.ts';
import { transformToGraphOptions } from '../../../../pages/Insights/utils';
import { apiSlice } from '../../../app/apiSlice.ts';

export const getMostFrequentAlertPlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getMostFrequentAlertPlayground: builder.query<any, any>({
      query: ({ filter_channels, filter_alert_types }) => ({
        url: GET_MOST_FREQUENT_ALERT_PLAYGROUND,
        method: 'POST',
        body: {
          filter_channels,
          filter_alert_types
        }
      }),
      transformResponse: response => {
        if (response.metric_response) return transformToGraphOptions(response);
        else return [];
      }
    })
  })
});

export const { useLazyGetMostFrequentAlertPlaygroundQuery } = getMostFrequentAlertPlaygroundApi;
