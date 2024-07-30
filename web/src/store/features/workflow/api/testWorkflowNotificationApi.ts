import { TEST_WORKFLOW_NOTIFICATION } from "../../../../constants/index.ts";
import { stateToWorkflow } from "../../../../utils/parser/workflow/stateToWorkflow.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const testWorkflowNotificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    testWorkflowNotification: builder.query<any, void>({
      query: () => ({
        url: TEST_WORKFLOW_NOTIFICATION,
        body: stateToWorkflow(),
        method: "POST",
      }),
    }),
  }),
});

export const { useLazyTestWorkflowNotificationQuery } =
  testWorkflowNotificationApi;
