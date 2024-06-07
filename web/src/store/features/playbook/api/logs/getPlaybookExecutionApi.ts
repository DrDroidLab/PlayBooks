import { GET_PLAYBOOK_EXECUTION } from "../../../../../constants/index.ts";
import { apiSlice } from "../../../../app/apiSlice.ts";

export const getPlaybookExecutionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlaybookExecution: builder.query<any, { playbookRunId: string }>({
      query: ({ playbookRunId }) => {
        return {
          url: GET_PLAYBOOK_EXECUTION,
          body: {
            playbook_run_id: playbookRunId,
          },
          method: "POST",
        };
      },
    }),
  }),
});

export const { useLazyGetPlaybookExecutionQuery } = getPlaybookExecutionApi;
