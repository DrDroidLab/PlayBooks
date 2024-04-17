import { GET_ALERT_OPTIONS_PLAYGROUND } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';
import {
  setSelectedActiveChannels,
  setSelectedAlertTypes
} from '../alertInsightsPlaygroundSlice.ts';

export const getAlertOptionsPlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAlertOptionsPlayground: builder.query<any, any>({
      query: () => ({
        url: GET_ALERT_OPTIONS_PLAYGROUND,
        method: 'POST',
        body: {
          connector_type_requests: [
            {
              connector_type: 'SLACK'
            },
            {
              connector_type: 'GOOGLE_CHAT'
            }
          ]
        }
      }),
      transformResponse(data, _) {
        const { alert_ops_options } = data;
        const { comm_options } = alert_ops_options;
        const { workspaces } = comm_options;
        const { active_channels, alert_types } = workspaces[0];
        const activeChannels = active_channels?.map(channel => {
          const { channel_name, id } = channel;
          return {
            label: channel_name,
            id: id
          };
        });
        const filteredAlertAlertType = alert_types.filter(
          (value, index, self) => index === self.findIndex(t => t.alert_type === value.alert_type)
        );
        const alertTypes = filteredAlertAlertType
          ?.map(alertType => {
            const { alert_type, id } = alertType;
            return {
              label: alert_type,
              id: id
            };
          })
          .filter(({ label }) => label !== 'Not an alert');
        return {
          activeChannels,
          alertTypes
        };
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          // Wait for the query to complete
          const { data } = await queryFulfilled;
          // Dispatch an action to update the global state
          dispatch(setSelectedActiveChannels(data.activeChannels));
          dispatch(setSelectedAlertTypes(data.alertTypes));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      }
    })
  })
});

export const { useGetAlertOptionsPlaygroundQuery } = getAlertOptionsPlaygroundApi;
