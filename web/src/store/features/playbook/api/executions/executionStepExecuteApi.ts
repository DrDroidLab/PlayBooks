import { EXECUTION_STEP_EXECUTE } from "../../../../../constants/index.ts";
import { apiSlice } from "../../../../app/apiSlice.ts";
import { store } from "../../../../index.ts";
import { playbookSelector } from "../../playbookSlice.ts";

export const executionStepExecuteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    executionStepExecute: builder.mutation<any, any>({
      query: (step) => {
        const { executionId } = playbookSelector(store.getState());
        return {
          url: EXECUTION_STEP_EXECUTE,
          body: { playbook_run_id: executionId, step },
          method: "POST",
        };
      },
    }),
  }),
});

export const {
  endpoints: { executionStepExecute },
} = executionStepExecuteApi;
