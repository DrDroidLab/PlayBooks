import { STOP_WORKFLOW_EXECUTION } from "../../../../../constants";
import { apiSlice } from "../../../../app/apiSlice";

export const stopWorkflowExecutionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    stopWorkflowExecution: builder.mutation<any, string>({
      query: (workflow_run_id) => ({
        url: STOP_WORKFLOW_EXECUTION,
        body: {
          workflow_run_id,
        },
        method: "POST",
      }),
      invalidatesTags: ["Workflows"],
    }),
  }),
});

export const { useStopWorkflowExecutionMutation } = stopWorkflowExecutionApi;
