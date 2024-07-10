import { GET_PLAYBOOK_EXECUTION } from "../../../../../constants/index.ts";
import { apiSlice } from "../../../../app/apiSlice.ts";
import {
  playbookSelector,
  pushToExecutionStack,
  setPlaybookData,
} from "../../playbookSlice.ts";
import { store } from "../../../../index.ts";
import { Playbook } from "../../../../../types/playbook.ts";
import executionToState from "../../../../../utils/parser/playbook/executionToState.ts";
import { Step } from "../../../../../types/step.ts";

export const getPlaybookExecutionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlaybookExecution: builder.query<Playbook, void>({
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
      transformResponse: (response: any) => {
        return executionToState(response?.playbook_execution);
      },
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setPlaybookData(data));
          const steps = data.ui_requirement.executedSteps ?? [];
          const lastStep = steps[steps.length - 1];
          const relations = data?.step_relations?.filter(
            (relation) => (relation.parent as Step)?.id === lastStep?.id,
          );
          const nextPossibleStepLogs = relations?.filter(
            (relation) =>
              relation.ui_requirement?.evaluation?.evaluation_result,
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
