import { UPDATE_SLACK_RCA } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const updateSlackRcaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateSlackRca: builder.mutation<any, { channelId: string; val: boolean }>({
      query: ({ channelId, val }) => ({
        url: UPDATE_SLACK_RCA,
        method: "POST",
        body: {
          slack_channel_connector_key_id: channelId,
          is_auto_rca_enabled: val,
        },
      }),
    }),
  }),
});

export const {
  endpoints: { updateSlackRca },
} = updateSlackRcaApi;
