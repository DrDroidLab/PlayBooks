import { GET_WORKFLOW_EXECUTION_LOGS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setWorkflowKey } from "../workflowSlice.ts";

export const getWorkflowExecutionLogsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkflowExecutionLogs: builder.query<any, { workflowRunId: string }>({
      query: ({ workflowRunId }) => ({
        url: GET_WORKFLOW_EXECUTION_LOGS,
        method: "POST",
        body: {
          workflow_run_id: workflowRunId,
        },
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setWorkflowKey({ key: "meta", value: data.meta }));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
    }),
  }),
});

export const { useGetWorkflowExecutionLogsQuery } = getWorkflowExecutionLogsApi;
