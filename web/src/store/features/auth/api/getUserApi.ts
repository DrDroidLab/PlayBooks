import { GET_USER } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getUserApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<any, void>({
      query: () => ({
        url: GET_USER,
        method: "POST",
      }),
    }),
  }),
});

export const { useGetUserQuery } = getUserApi;
