import { GET_ALERT_TAGS_PLAYGROUND } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

export const getAlertTagsPlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAlertTagsPlayground: builder.query<any, any>({
      query: ({ filter_alert_types, filter_channels }) => ({
        url: GET_ALERT_TAGS_PLAYGROUND,
        method: 'POST',
        body: {
          filter_alert_types,
          filter_channels
        }
      }),
      transformResponse: response => {
        return response.alert_ops_options;
      },
      async onQueryStarted(_, { extra, queryFulfilled }) {
        const currentState = (extra as any)?.store.getState();
        const selectedActiveChannels = currentState?.alertInghtsPlayground?.selectedActiveChannels;
        const selectedAlertTypes = currentState?.alertInghtsPlayground?.selectedAlertTypes;

        try {
          const { data: tag_options } = await queryFulfilled;
          const filtered_tag_options = tag_options?.comm_options?.workspaces[0].alert_tags.filter(
            tag_option => {
              const { active_channel_id, alert_type_id } = tag_option;
              const is_active_channel = selectedActiveChannels?.find(
                ({ id }) => id === active_channel_id
              );
              const is_alert_type = selectedAlertTypes?.find(({ id }) => id === alert_type_id);
              return is_active_channel && is_alert_type;
            }
          );

          const enriched_filtered_tag_options = filtered_tag_options?.map(tag_option => {
            const { active_channel_id, alert_type_id, alert_tag } = tag_option;
            const active_channel_label = selectedActiveChannels?.find(
              ({ id }) => id === active_channel_id
            ).label;
            const alert_type_label = selectedAlertTypes?.find(
              ({ id }) => id === alert_type_id
            ).label;
            return {
              ...tag_option,
              active_channel_label: active_channel_label,
              alert_type_label: alert_type_label,
              label: alert_tag
            };
          });

          return enriched_filtered_tag_options;
        } catch (e) {
          console.log(e);
        }
      }
    })
  })
});

export const { useLazyGetAlertTagsPlaygroundQuery } = getAlertTagsPlaygroundApi;
