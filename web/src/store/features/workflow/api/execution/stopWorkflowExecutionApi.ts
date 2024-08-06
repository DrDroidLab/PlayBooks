import { STOP_WORKFLOW_EXECUTION } from "../../../../../constants";
import { apiSlice } from "../../../../app/apiSlice";

export const stopWorkflowExecutionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    stopWorkflowExecution: builder.mutation<any, Record<string, string>>({
      query: (body) => ({
        url: STOP_WORKFLOW_EXECUTION,
        body,
        method: "POST",
      }),
      invalidatesTags: ["Workflows"],
    }),
  }),
});

export const { useStopWorkflowExecutionMutation } = stopWorkflowExecutionApi;
