import { EXECUTE_TASK } from "../../../../../constants/index.ts";
import { apiSlice } from "../../../../app/apiSlice.ts";

export const executionTaskExecuteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    executionTaskExecute: builder.mutation<any, any>({
      query: (task) => ({
        url: EXECUTE_TASK,
        body: { playbook_task: task },
        method: "POST",
      }),
    }),
  }),
});

export const {
  endpoints: { executionTaskExecute },
} = executionTaskExecuteApi;
