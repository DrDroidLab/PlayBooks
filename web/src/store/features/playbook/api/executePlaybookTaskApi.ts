import { EXECUTE_TASK } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const executePlaybookTaskApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    executePlaybookTask: builder.mutation<any, any>({
      query: (body) => ({
        url: EXECUTE_TASK,
        body,
        method: "POST",
      }),
    }),
  }),
});

export const {
  endpoints: { executePlaybookTask },
} = executePlaybookTaskApi;
