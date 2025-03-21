import { SECRET_DELETE } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const deleteSecretApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    deleteSecret: builder.mutation<any, { id: number | string }>({
      query: ({ id }) => ({
        url: SECRET_DELETE,
        method: "POST",
        body: {
          update_secret_ops: [
            {
              secret_id: id,
              op: "UPDATE_SECRET_STATUS",
              update_secret_status: {
                is_active: false,
              },
            },
          ],
        },
      }),
      invalidatesTags: ["Secrets"],
    }),
  }),
});

export const { useDeleteSecretMutation } = deleteSecretApi;
