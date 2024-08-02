import { LOGOUT_USER } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { logOut } from "../authSlice.ts";

export const logoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    logout: builder.mutation<any, void>({
      query: () => ({
        url: LOGOUT_USER,
        method: "POST",
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          localStorage.removeItem("email");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          dispatch(logOut());
        } catch (error) {
          console.log(error);
        }
      },
    }),
  }),
});

export const { useLogoutMutation } = logoutApi;
