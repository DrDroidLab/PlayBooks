import { SECRETS_LIST } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setSecretKey } from "../secretsSlice.ts";

export const getSecretApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSecret: builder.query<any, { id: number | string }>({
      query: ({ id }) => ({
        url: SECRETS_LIST,
        body: {
          secret_ids: [id],
        },
        method: "POST",
      }),
      transformResponse: (response) => {
        const secret = response?.secrets?.[0] ?? {};
        return secret;
      },
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setSecretKey({
              key: "key",
              value: data?.key ?? "",
            }),
          );
          dispatch(
            setSecretKey({
              key: "description",
              value: data?.description ?? "",
            }),
          );
          dispatch(
            setSecretKey({
              key: "value",
              value: (data?.value ?? []).join(", "),
            }),
          );
        } catch (error) {
          console.log(error);
        }
      },
      providesTags: ["Secrets"],
    }),
  }),
});

export const { useGetSecretQuery } = getSecretApi;
