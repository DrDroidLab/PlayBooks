import { GET_SLACK_ALERT_METRIC_PLAYGROUND } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

export const getAlertMetricPlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAlertMetricPlayground: builder.query<any, any>({
      query: ({ filter_channels, filter_alert_types }) => ({
        url: GET_SLACK_ALERT_METRIC_PLAYGROUND,
        method: 'POST',
        body: {
          metric_title: 'ALERT_DISTRIBUTION_BY_ALERT_TAG',
          metric_name: 'ALERT_DISTRIBUTION_BY_ALERT_TAG',
          filter_channels,
          filter_alert_types
        }
      }),
      transformResponse: response => {
        return response.metric_map;
      }
    })
  })
});

export const { useLazyGetAlertMetricPlaygroundQuery } = getAlertMetricPlaygroundApi;
