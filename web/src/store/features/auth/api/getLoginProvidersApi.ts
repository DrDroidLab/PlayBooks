import { GET_LOGIN_PROVIDERS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getLoginProvidersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLoginProviders: builder.query<any, void>({
      query: () => ({
        url: GET_LOGIN_PROVIDERS,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        return [...(response?.active_providers ?? []), "EMAIL"];
      },
    }),
  }),
});

export const { useGetLoginProvidersQuery } = getLoginProvidersApi;
