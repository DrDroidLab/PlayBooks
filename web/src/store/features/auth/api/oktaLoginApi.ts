import posthog from "posthog-js";
import { OKTA_LOGIN } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setCredentials } from "../authSlice.ts";

export const oktaLoginApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    oktaLogin: builder.mutation<any, void>({
      query: () => ({
        url: OKTA_LOGIN,
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

export const { useOktaLoginMutation } = oktaLoginApi;
