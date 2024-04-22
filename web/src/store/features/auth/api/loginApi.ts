import posthog from "posthog-js";
import { LOGIN } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setCredentials } from "../authSlice.ts";

export const loginApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, any>({
      query: ({ email, password }) => ({
        url: LOGIN,
        method: "POST",
        body: {
          email: email,
          password: password,
        },
      }),
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        try {
          const email = args.email;
          const { data } = await queryFulfilled;
          const accessToken = data?.access_token;
          const refreshToken = data?.refresh_token;
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

export const { useLoginMutation } = loginApi;
