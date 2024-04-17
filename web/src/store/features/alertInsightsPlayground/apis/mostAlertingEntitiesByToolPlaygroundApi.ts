import { GET_MOST_ALERTING_ENTITIES_BY_TOOLS_PLAYGROUND } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

const currentTimestamp = Math.floor(Date.now() / 1000);

export const getMostAlertingEntitiesByToolPlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getMostAlertingEntitiesByToolPlayground: builder.query<any, any>({
      query: ({ filter_channels, filter_alert_types }) => ({
        url: GET_MOST_ALERTING_ENTITIES_BY_TOOLS_PLAYGROUND,
        method: 'POST',
        body: {
          filter_channels,
          filter_alert_types,
          threshold: 9,
          meta: {
            timeRange: { time_geq: currentTimestamp - 1209600, time_lt: currentTimestamp }
          }
        }
      }),
      transformResponse: response => {
        let processed_data = response?.tool_alerting_entities?.sort(function (a, b) {
          return parseInt(b['frequency']) - parseInt(a['frequency']);
        });

        processed_data?.forEach((item, index) => {
          const metadata_dict = {};
          item.alert_entity_resource_metadata.forEach(item => {
            metadata_dict[item.key] = item.value;
          });
          item.metadata = JSON.stringify(metadata_dict);
        });

        return processed_data ?? [];
      }
    })
  })
});

export const { useLazyGetMostAlertingEntitiesByToolPlaygroundQuery } =
  getMostAlertingEntitiesByToolPlaygroundApi;
