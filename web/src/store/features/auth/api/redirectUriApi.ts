import { REDIRECT_URI } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const redirectUriApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    redirectUri: builder.mutation<any, void>({
      query: () => ({
        url: REDIRECT_URI,
        method: "GET",
      }),
    }),
  }),
});

export const { useRedirectUriMutation } = redirectUriApi;
