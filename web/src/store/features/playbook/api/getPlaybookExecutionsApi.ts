import { GET_PLAYBOOK_EXECUTIONS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setMeta } from "../playbookSlice.ts";

export const getPlaybookExecutionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlaybookExecutions: builder.query<
      any,
      { limit: number; offset: number; playbookId: string }
    >({
      query: ({ limit, offset, playbookId }) => ({
        url: GET_PLAYBOOK_EXECUTIONS,
        method: "POST",
        body: {
          playbook_ids: playbookId ? [playbookId] : [],
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
          dispatch(setMeta(data.meta));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
      providesTags: ["Workflows"],
    }),
  }),
});

export const { useGetPlaybookExecutionsQuery } = getPlaybookExecutionsApi;
