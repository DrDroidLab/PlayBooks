import { GET_SLACK_ALERT_METRIC_PLAYGROUND } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

export const slackAlertMetricPlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getSlackAlertMetricPlayground: builder.query<any, any>({
      query: ({ filter_channels, filter_alert_types }) => ({
        url: GET_SLACK_ALERT_METRIC_PLAYGROUND,
        method: 'POST',
        body: {
          metric_title: 'ALERT_WEEKLY_DISTRIBUTION_BY_ALERT_TITLE',
          metric_name: 'ALERT_WEEKLY_DISTRIBUTION_BY_ALERT_TITLE',
          filter_channels,
          filter_alert_types,
          meta: {
            time_range: {
              time_geq: Math.round(
                new Date(new Date().getTime() - 6 * 7 * 24 * 60 * 60 * 1000).getTime() / 1000
              ),
              time_lt: Math.round(Date.now() / 1000)
            }
          }
        }
      }),
      transformResponse: (response: any) => {
        return (
          response?.metric_map?.ALERT_WEEKLY_DISTRIBUTION_BY_ALERT_TITLE?.metric_responses[0]
            ?.data ?? []
        );
      }
    })
  })
});

export const { useLazyGetSlackAlertMetricPlaygroundQuery } = slackAlertMetricPlaygroundApi;
