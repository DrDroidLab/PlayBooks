import { GET_WORKFLOWS } from "../../../../constants/index.ts";
import { workflowToState } from "../../../../utils/parser/workflow/workflowToState.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setWorkflowKey } from "../workflowSlice.ts";

export const getWorkflowApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkflow: builder.query<any, { limit: number; offset: number }>({
      query: (workflowId) => ({
        url: GET_WORKFLOWS,
        method: "POST",
        body: {
          workflow_ids: [workflowId],
        },
      }),
      transformResponse: (response) => {
        return response?.workflows[0];
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setWorkflowKey({
              key: "currentWorkflow",
              value: workflowToState(data),
            }),
          );
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
      providesTags: ["Workflows"],
    }),
  }),
});

export const { useLazyGetWorkflowQuery } = getWorkflowApi;
