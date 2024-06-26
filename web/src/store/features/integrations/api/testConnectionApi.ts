import { TEST_CONNECTION } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setTestConnectorData } from "../integrationsSlice.ts";

export const testConnectionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    testConnection: builder.query<any, any>({
      query: ({ keys, type, id }) => ({
        url: TEST_CONNECTION,
        method: "POST",
        body: {
          connector: {
            type: type,
            id: id,
          },
          connector_keys: keys,
        },
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          dispatch(setTestConnectorData(undefined));
          const { data } = await queryFulfilled;
          dispatch(setTestConnectorData(data));
          console.log("data", data);
        } catch (error) {
          // Handle any errors
          console.log(error);
          dispatch(setTestConnectorData({ error: error?.error }));
        }
      },
    }),
  }),
});

export const { useLazyTestConnectionQuery } = testConnectionApi;
