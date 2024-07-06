import { GET_SITE_URL } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getSiteUrlApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSiteUrl: builder.query<any, void>({
      query: () => ({
        url: GET_SITE_URL,
        method: "POST",
      }),
      providesTags: ["SiteURL"],
    }),
  }),
});

export const { useGetSiteUrlQuery } = getSiteUrlApi;
