import { GET_CONNECTED_PLAYBOOKS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getConnectedPlaybooksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConnectedPlaybooks: builder.query<any, string>({
      query: (connectorId) => ({
        url: GET_CONNECTED_PLAYBOOKS,
        method: "POST",
        body: {
          connector_id: connectorId,
        },
      }),
      transformResponse: (response: any) => {
        return response?.connected_playbooks ?? [];
      },
    }),
  }),
});

export const { useGetConnectedPlaybooksQuery } = getConnectedPlaybooksApi;
