import { GET_CONNECTOR_ASSETS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getConnectorAssetsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConnectorAssets: builder.query<any, string>({
      query: (connectorType) => ({
        url: GET_CONNECTOR_ASSETS,
        method: "POST",
        body: {
          connector_type: connectorType,
        },
      }),
      providesTags: ["Integrations"],
    }),
  }),
});

export const { useGetConnectorAssetsQuery } = getConnectorAssetsApi;
