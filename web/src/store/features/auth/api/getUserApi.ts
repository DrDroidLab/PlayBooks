import { GET_USER } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setUser } from "../authSlice.ts";

export const getUserApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<any, void>({
      query: () => ({
        url: GET_USER,
        method: "POST",
      }),
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
    }),
  }),
});

export const { useGetUserQuery } = getUserApi;
