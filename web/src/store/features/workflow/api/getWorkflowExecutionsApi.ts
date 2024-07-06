import { GET_WORKFLOW_EXECUTIONS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setWorkflowKey } from "../workflowSlice.ts";

export const getWorkflowExecutionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkflowExecutions: builder.query<any, { workflowId: string }>({
      query: ({ workflowId }) => ({
        url: GET_WORKFLOW_EXECUTIONS,
        method: "POST",
        body: {
          workflow_ids: workflowId ? [workflowId] : [],
        },
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setWorkflowKey({ key: "workflows", value: data.workflows }));
          dispatch(setWorkflowKey({ key: "meta", value: data.meta }));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
      providesTags: ["Workflows"],
    }),
  }),
});

export const { useGetWorkflowExecutionsQuery } = getWorkflowExecutionsApi;
