import posthog from "posthog-js";
import { apiSlice } from "../../../../app/apiSlice.ts";
import { OKTA_OAUTH } from "../../../../../constants/index.ts";
import { setCredentials } from "../../authSlice.ts";

export const oktaOAuthApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    oktaOAuth: builder.mutation<any, string>({
      query: (query) => ({
        url: `${OKTA_OAUTH}?${query}`,
        method: "GET",
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const accessToken = data?.access_token;
          const refreshToken = data?.refresh_token;
          const email = data?.user?.email;
          dispatch(setCredentials({ accessToken, refreshToken, email }));
          localStorage.setItem("email", email);
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("refresh_token", accessToken);
          posthog.identify(email);
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
    }),
  }),
});

export const { useOktaOAuthMutation } = oktaOAuthApi;
