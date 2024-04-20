import { CREATE_CONNECTOR_STATUS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const createConnectorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createConnector: builder.mutation<any, any>({
      query: ({ keys, type }) => ({
        url: CREATE_CONNECTOR_STATUS,
        method: "POST",
        body: {
          connector: {
            type: type,
          },
          connector_keys: keys,
        },
      }),
      invalidatesTags: ["Integrations"],
    }),
  }),
});

export const { useCreateConnectorMutation } = createConnectorApi;
