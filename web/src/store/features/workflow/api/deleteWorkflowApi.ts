import { DELETE_WORKFLOW } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const deleteWorkflowApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    deleteWorkflow: builder.mutation<any, string | number>({
      query: (workflowId) => ({
        url: DELETE_WORKFLOW,
        method: "POST",
        body: {
          workflow_id: workflowId,
          update_workflow_ops: [
            {
              op: "UPDATE_WORKFLOW_STATUS",
              update_workflow_status: {
                is_active: false,
              },
            },
          ],
        },
      }),
      invalidatesTags: ["Workflows"],
    }),
  }),
});

export const { useDeleteWorkflowMutation } = deleteWorkflowApi;
