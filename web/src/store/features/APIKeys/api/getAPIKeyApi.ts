import { FETCH_API_TOKEN } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getAPIKeyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAPIKey: builder.query<any, any>({
      query: ({ limit, offset }) => ({
        url: FETCH_API_TOKEN,
        method: "POST",
        body: {
          meta: {
            page: {
              limit,
              offset,
            },
          },
        },
      }),
      providesTags: ["API_Tokens"],
    }),
  }),
});

export const { useGetAPIKeyQuery } = getAPIKeyApi;
