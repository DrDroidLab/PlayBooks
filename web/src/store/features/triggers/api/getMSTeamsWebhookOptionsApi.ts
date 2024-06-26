import { ALL_CONNECTORS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getMSTeamsWebhookOptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMSTeamsWebhookOptions: builder.query<any, void>({
      query: () => ({
        url: ALL_CONNECTORS,
        method: "POST",
        body: {
          connector_type: "MS_TEAMS",
        },
      }),
      transformResponse: (response) => {
        if (response?.connectors?.length > 0) {
          const active_webhooks = response.connectors.map((connector: any) => ({
            name: connector.name,
            keyId: connector.keys.find(
              (key: any) => key.key_type === "MS_TEAMS_CONNECTOR_WEBHOOK_URL",
            )?.key,
          }));
          return active_webhooks;
        }
        return [];
      },
    }),
  }),
});

export const { useGetMSTeamsWebhookOptionsQuery } = getMSTeamsWebhookOptionsApi;
