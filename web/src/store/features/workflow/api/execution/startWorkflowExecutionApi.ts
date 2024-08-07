import { EXECUTE_WORKFLOW } from "../../../../../constants";
import { apiSlice } from "../../../../app/apiSlice";

export const startWorkflowExecutionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    startWorkflowExecution: builder.mutation<any, string>({
      query: (workflow_id) => ({
        url: EXECUTE_WORKFLOW,
        body: {
          workflow_id,
        },
        method: "POST",
      }),
      invalidatesTags: ["Workflows"],
    }),
  }),
});

export const { useStartWorkflowExecutionMutation } = startWorkflowExecutionApi;
