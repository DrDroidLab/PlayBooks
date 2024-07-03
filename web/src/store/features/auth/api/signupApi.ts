import posthog from "posthog-js";
import { SIGNUP } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setCredentials } from "../authSlice.ts";

export const signupApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<any, any>({
      query: ({ email, password, firstName, lastName }) => ({
        url: SIGNUP,
        method: "POST",
        body: {
          email: email,
          first_name: firstName,
          last_name: lastName,
          password: password,
        },
      }),
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        try {
          const email = args.email;
          const first_name = args.firstName;
          const last_name = args.lastName;
          const { data } = await queryFulfilled;
          const accessToken = data?.access_token;
          const refreshToken = data?.refresh_token;
          dispatch(setCredentials({ accessToken, refreshToken, email }));
          localStorage.setItem("email", email);
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("refresh_token", accessToken);
          posthog.identify(email, {
            email: email,
            first_name,
            last_name,
            identify_type: "sign_up",
          });
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
    }),
  }),
});

export const { useSignupMutation } = signupApi;
