import { SECRET_DELETE } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const deleteSecretApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    deleteSecret: builder.mutation<any, { id: number | string }>({
      query: ({ id }) => ({
        url: SECRET_DELETE,
        method: "POST",
        body: {
          secret_id: id,
          update_secret_ops: [
            {
              op: "UPDATE_STATUS",
              update_status: {
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
