import { GET_ALERT_DISTRIBUTION_BY_CHANNEL_PLAYGROUND } from '../../../../constants/index.ts';
import { transformToGraphOptions } from '../../../../pages/Insights/utils.jsx';
import { apiSlice } from '../../../app/apiSlice.ts';

export const getAlertDistributionByChannelPlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAlertDistributionByChannelPlayground: builder.query<any, any>({
      query: ({ filter_channels, filter_alert_types }) => ({
        url: GET_ALERT_DISTRIBUTION_BY_CHANNEL_PLAYGROUND,
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

export const { useLazyGetAlertDistributionByChannelPlaygroundQuery } =
  getAlertDistributionByChannelPlaygroundApi;
