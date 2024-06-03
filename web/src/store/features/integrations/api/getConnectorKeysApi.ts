import { GET_CONNECTOR_KEYS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setConnector, setKey } from "../integrationsSlice.ts";

export const getConnectorKeysApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConnectorKeys: builder.query<any, number>({
      query: (id) => ({
        url: GET_CONNECTOR_KEYS,
        method: "POST",
        body: {
          connector_id: id,
        },
      }),
      providesTags: ["Integrations"],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const connector = data?.connector;
          dispatch(setConnector(connector));
          data?.connector_keys?.forEach((key) => {
            dispatch(setKey({ key: key.key_type, value: key.key }));
          });
        } catch (e) {
          console.log(e);
        }
      },
    }),
  }),
});

export const { useLazyGetConnectorKeysQuery, useGetConnectorKeysQuery } =
  getConnectorKeysApi;
