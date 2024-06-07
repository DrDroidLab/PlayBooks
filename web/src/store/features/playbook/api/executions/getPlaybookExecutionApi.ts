import { GET_PLAYBOOK_EXECUTION } from "../../../../../constants/index.ts";
import { executionToPlaybook } from "../../../../../utils/parser/playbook/executionToPlaybook.ts";
import { apiSlice } from "../../../../app/apiSlice.ts";
import { store } from "../../../../index.ts";
import { playbookSelector } from "../../playbookSlice.ts";

export const getPlaybookExecutionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlaybookExecution: builder.query<any, void>({
      query: () => {
        const { executionId } = playbookSelector(store.getState());
        return {
          url: GET_PLAYBOOK_EXECUTION,
          body: { playbook_run_id: executionId },
          method: "POST",
        };
      },
      transformResponse: (response) => {
        return executionToPlaybook(response?.playbook_execution ?? {});
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          //   dispatch(setCurrentPlaybook(data));
          //   dispatch(setPlaybookData(data));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
      providesTags: ["Playbooks"],
    }),
  }),
});

export const { useGetPlaybookExecutionQuery } = getPlaybookExecutionApi;
