import { VERSION_INFO } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const fetchVersionInfoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchVersionInfo: builder.query<any, void>({
      query: () => ({
        url: VERSION_INFO,
        method: "POST",
      }),
    }),
  }),
});

export const { useFetchVersionInfoQuery } = fetchVersionInfoApi;
