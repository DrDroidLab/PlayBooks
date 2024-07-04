import { SAVE_SITE_URL } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const updateSiteUrlApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateSiteUrl: builder.mutation<any, any>({
      query: () => ({
        url: SAVE_SITE_URL,
        method: "POST",
        body: {
          host_name: "",
        },
      }),
    }),
  }),
});

export const { useUpdateSiteUrlMutation } = updateSiteUrlApi;
