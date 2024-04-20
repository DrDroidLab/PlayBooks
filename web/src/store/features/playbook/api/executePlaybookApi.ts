import { EXECUTE_TASK } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const executePlaybookApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    executePlaybook: builder.mutation<any, any>({
      query: (body) => ({
        url: EXECUTE_TASK,
        body,
        method: "POST",
      }),
    }),
  }),
});

export const { useExecutePlaybookMutation } = executePlaybookApi;
