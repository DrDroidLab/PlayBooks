import { SLACK_CONNECT } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const requestSlackConnectApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    requestSlackConnect: builder.query<any, void>({
      query: () => ({
        url: SLACK_CONNECT,
        method: "POST",
      }),
    }),
  }),
});

export const { useLazyRequestSlackConnectQuery } = requestSlackConnectApi;
