import { GET_PLAYBOOK_EXECUTION } from "../../../../../constants/index.ts";
import { apiSlice } from "../../../../app/apiSlice.ts";
import { playbookSelector, pushToExecutionStack } from "../../playbookSlice.ts";
import { store } from "../../../../index.ts";
import { addOutputsToSteps } from "../../../../../utils/playbook/addOutputsToSteps.ts";
import { executionToPlaybook } from "../../../../../utils/parser/playbook/executionToPlaybook.ts";

export const getPlaybookExecutionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlaybookExecution: builder.query<any, void>({
      query: () => {
        const { executionId } = playbookSelector(store.getState());
        return {
          url: GET_PLAYBOOK_EXECUTION,
          body: {
            playbook_run_id: executionId,
            meta: {},
          },
          method: "POST",
        };
      },
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          const steps = executionToPlaybook(data?.playbook_execution);
          addOutputsToSteps(steps);
          const lastStep = steps[steps.length - 1];
          const relationLogs = lastStep?.relationLogs ?? [];
          const nextPossibleStepLogs = relationLogs?.filter(
            (log: any) => log.evaluation_result,
          );
          dispatch(
            pushToExecutionStack((nextPossibleStepLogs ?? []).reverse()),
          );
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
    }),
  }),
});

export const {
  useGetPlaybookExecutionQuery,
  useLazyGetPlaybookExecutionQuery,
} = getPlaybookExecutionApi;
