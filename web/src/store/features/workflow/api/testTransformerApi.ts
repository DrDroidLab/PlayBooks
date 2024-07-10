import { TEST_TRANSFORMER } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { store } from "../../../index.ts";
import { currentWorkflowSelector } from "../workflowSlice.ts";

export const testTransformerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    testTransformer: builder.mutation<any, void>({
      query: () => {
        const currentWorkflow = currentWorkflowSelector(store.getState());
        return {
          url: TEST_TRANSFORMER,
          body: {
            transformer_lambda_function: {
              definition: currentWorkflow.transformerCode,
            },
            event: JSON.parse(currentWorkflow.exampleInput),
          },
          method: "POST",
        };
      },
    }),
  }),
});

export const { useTestTransformerMutation } = testTransformerApi;
