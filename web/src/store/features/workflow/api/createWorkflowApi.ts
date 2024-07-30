import { CREATE_WORKFLOW } from "../../../../constants/index.ts";
import { stateToWorkflow } from "../../../../utils/parser/workflow/stateToWorkflow.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const createWorkflowApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createWorkflow: builder.mutation<any, void>({
      query: () => ({
        url: CREATE_WORKFLOW,
        body: stateToWorkflow(),
        method: "POST",
      }),
      invalidatesTags: ["Workflows"],
    }),
  }),
});

export const { useCreateWorkflowMutation } = createWorkflowApi;
