import { SECRETS_LIST } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getSecretsListApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSecretsList: builder.query<
      any,
      {
        meta?: any;
        key?: string;
      }
    >({
      query: () => ({
        url: SECRETS_LIST,
        method: "POST",
        body: {},
      }),
      providesTags: ["Secrets"],
    }),
  }),
});

export const { useGetSecretsListQuery } = getSecretsListApi;
