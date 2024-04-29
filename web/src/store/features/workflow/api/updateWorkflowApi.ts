import { UPDATE_WORKFLOW } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const updateWorkflowApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateWorkflow: builder.mutation<any, any>({
      query: (workflow) => ({
        url: UPDATE_WORKFLOW,
        body: {
          workflow_id: workflow.id,
          update_workflow_ops: [
            {
              op: "UPDATE_WORKFLOW",
              update_workflow: {
                workflow,
              },
            },
          ],
        },
        method: "POST",
      }),
      invalidatesTags: ["Workflows"],
    }),
  }),
});

export const { useUpdateWorkflowMutation } = updateWorkflowApi;
