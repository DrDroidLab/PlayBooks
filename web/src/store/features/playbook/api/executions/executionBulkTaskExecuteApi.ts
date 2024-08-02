import { EXECUTE_BULK_TASK } from "../../../../../constants/index.ts";
import { apiSlice } from "../../../../app/apiSlice.ts";

export const executionBulkTaskExecuteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    executionBulkTaskExecute: builder.mutation<any, any>({
      query: (task) => ({
        url: EXECUTE_BULK_TASK,
        body: { playbook_task: task },
        method: "POST",
      }),
    }),
  }),
});

export const {
  endpoints: { executionBulkTaskExecute },
} = executionBulkTaskExecuteApi;
