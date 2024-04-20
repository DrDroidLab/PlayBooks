import { GET_SLACK_ASSETS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getSlackAssetsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSlackAssets: builder.query<any, void>({
      query: () => ({
        url: GET_SLACK_ASSETS,
        method: "POST",
        body: {
          connector_type: "SLACK",
        },
      }),
    }),
  }),
});

export const { useGetSlackAssetsQuery } = getSlackAssetsApi;
