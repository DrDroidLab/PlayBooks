import { SECRET_CREATE } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { SecretsInitialState } from "../initialState.ts";

export const createSecretApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createSecret: builder.mutation<any, Omit<SecretsInitialState, "id">>({
      query: (body) => ({
        url: SECRET_CREATE,
        body: {
          secret: body,
        },
        method: "POST",
      }),
      invalidatesTags: ["Secrets"],
    }),
  }),
});

export const { useCreateSecretMutation } = createSecretApi;
