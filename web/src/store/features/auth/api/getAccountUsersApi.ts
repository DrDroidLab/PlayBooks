import { GET_ACCOUNT_USERS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getAccountUsersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccountUsers: builder.query<any, void>({
      query: () => ({
        url: GET_ACCOUNT_USERS,
        method: "POST",
      }),
      transformResponse: (response: any) => {
        return (
          response?.metric_map?.ALERT_WEEKLY_DISTRIBUTION_BY_ALERT_TITLE
            ?.metric_responses[0]?.data ?? []
        );
      },
    }),
  }),
});

export const { useGetAccountUsersQuery } = getAccountUsersApi;
