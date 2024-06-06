import { SAVE_SITE_URL } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const saveSiteUrlApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    saveSiteUrl: builder.query<any, any>({
      query: ({ siteUrl }) => ({
        url: SAVE_SITE_URL,
        method: "POST",
        body: {
          host_name: siteUrl,
        },
      }),
    }),
  }),
});

export const { useLazySaveSiteUrlQuery } = saveSiteUrlApi;
