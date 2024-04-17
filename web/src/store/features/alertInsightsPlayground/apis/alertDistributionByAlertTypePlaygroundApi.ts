import { GET_ALERT_DISTRIBUTION_BY_ALERT_TYPE_PLAYGROUND } from '../../../../constants/index.ts';
import { transformToGraphOptions } from '../../../../pages/Insights/utils';
import { apiSlice } from '../../../app/apiSlice.ts';

export const getAlertDistributionByAlertTypePlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAlertDistributionByAlertTypePlayground: builder.query<any, any>({
      query: ({ filter_channels, filter_alert_types }) => ({
        url: GET_ALERT_DISTRIBUTION_BY_ALERT_TYPE_PLAYGROUND,
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

export const { useLazyGetAlertDistributionByAlertTypePlaygroundQuery } =
  getAlertDistributionByAlertTypePlaygroundApi;
