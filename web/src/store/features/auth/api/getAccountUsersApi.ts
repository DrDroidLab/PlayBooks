import { GET_ACCOUNT_USERS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getAccountUsersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccountUsers: builder.query<any, void>({
      query: () => ({
        url: GET_ACCOUNT_USERS,
        method: "POST",
      }),
    }),
  }),
});

export const { useGetAccountUsersQuery } = getAccountUsersApi;
