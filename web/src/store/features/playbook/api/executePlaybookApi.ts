import { EXECUTE_PLAYBOOK } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const executePlaybookApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    executePlaybook: builder.mutation<any, any>({
      query: (playbook) => ({
        url: EXECUTE_PLAYBOOK,
        body: { playbook: playbook },
        method: "POST",
      }),
    }),
  }),
});

export const {
  endpoints: { executePlaybook },
} = executePlaybookApi;
