import { START_EXECUTION } from "../../../../../constants/index.ts";
import { apiSlice } from "../../../../app/apiSlice.ts";

export const startExecutionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    startExecution: builder.mutation<any, number>({
      query: (playbookId) => ({
        url: START_EXECUTION,
        body: {
          playbook_id: playbookId,
        },
        method: "POST",
      }),
    }),
  }),
});

export const { useStartExecutionMutation } = startExecutionApi;
