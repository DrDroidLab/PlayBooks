import { GET_WORKFLOWS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setWorkflowKey } from "../workflowSlice.ts";

export const getWorkflowsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkflows: builder.query<any, { limit: number; offset: number }>({
      query: ({ limit, offset }) => ({
        url: GET_WORKFLOWS,
        method: "POST",
        body: {
          meta: {
            page: {
              limit,
              offset,
            },
          },
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

export const { useGetWorkflowsQuery } = getWorkflowsApi;
