import { REDIRECT_URI } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const redirectUriApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    redirectUri: builder.mutation<any, string>({
      query: (oauthId) => ({
        url: `${REDIRECT_URI}/${oauthId}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useRedirectUriMutation } = redirectUriApi;
