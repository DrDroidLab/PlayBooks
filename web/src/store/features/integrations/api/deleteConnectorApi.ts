import { UPDATE_CONNECTOR_STATUS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const deleteConnectorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    deleteConnector: builder.mutation<any, number>({
      query: (id) => ({
        url: UPDATE_CONNECTOR_STATUS,
        method: "POST",
        body: {
          connector_id: id,
          update_connector_ops: [
            {
              op: "UPDATE_CONNECTOR_STATUS",
              update_connector_status: {
                is_active: false,
              },
            },
          ],
        },
      }),
      invalidatesTags: ["Integrations"],
    }),
  }),
});

export const { useDeleteConnectorMutation } = deleteConnectorApi;
