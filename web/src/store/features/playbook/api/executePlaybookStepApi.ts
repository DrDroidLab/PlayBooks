import { EXECUTE_STEP } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const executePlaybookStepApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    executePlaybookStep: builder.mutation<any, any>({
      query: (step) => ({
        url: EXECUTE_STEP,
        body: { playbook_step: step },
        method: "POST",
      }),
    }),
  }),
});

export const {
  endpoints: { executePlaybookStep },
} = executePlaybookStepApi;
