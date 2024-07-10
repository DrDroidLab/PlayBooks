import { VERSION_INFO } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const fetchVersionInfoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchVersionInfo: builder.query<any, { limit: number; offset: number }>({
      query: () => ({
        url: VERSION_INFO,
        method: "POST",
      })
    }),
  }),
});

export const { useFetchVersionInfoQuery } = fetchVersionInfoApi;