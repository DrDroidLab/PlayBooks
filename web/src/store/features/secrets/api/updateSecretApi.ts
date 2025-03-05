import { SECRET_UPDATE } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { SecretsInitialState } from "../initialState.ts";

export const updateSecretApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateSecret: builder.mutation<any, SecretsInitialState>({
      query: (secret) => ({
        url: SECRET_UPDATE,
        body: {
          update_secret_ops: [
            {
              op: "UPDATE_SECRET",
              secret_id: secret.id,
              update_secret: {
                value: secret.value,
                description: secret.description,
              },
            },
          ],
        },
        method: "POST",
      }),
      invalidatesTags: ["Secrets"],
    }),
  }),
});

export const { useUpdateSecretMutation } = updateSecretApi;
