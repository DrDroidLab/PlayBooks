import { GET_MOST_FREQUENT_DISTRIBUTION_PLAYGROUND } from '../../../../constants/index.ts';
import { transformForScatterPlot } from '../../../../pages/Insights/utils';
import { apiSlice } from '../../../app/apiSlice.ts';

export const getMostFrequentAlertDistributionPlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getMostFrequentAlertDistributionPlayground: builder.query<any, any>({
      query: ({ filter_channels, filter_alert_types }) => ({
        url: GET_MOST_FREQUENT_DISTRIBUTION_PLAYGROUND,
        method: 'POST',
        body: {
          filter_alert_types,
          filter_channels
        }
      }),
      transformResponse: response => {
        if (response.metric_response) return transformForScatterPlot(response);
        else return [];
      }
    })
  })
});

export const { useLazyGetMostFrequentAlertDistributionPlaygroundQuery } =
  getMostFrequentAlertDistributionPlaygroundApi;
