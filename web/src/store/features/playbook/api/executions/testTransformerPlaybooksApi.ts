import { TEST_TRANSFORMER_PLAYBOOKS } from "../../../../../constants";
import { apiSlice } from "../../../../app/apiSlice";

export const testTransformerPlaybooksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    testTransformerPlaybooks: builder.mutation<
      any,
      { transformerCode: string; payload: string }
    >({
      query: ({ transformerCode, payload }) => ({
        url: TEST_TRANSFORMER_PLAYBOOKS,
        body: {
          transformer_lambda_function: {
            definition: transformerCode,
          },
          payload,
        },
        method: "POST",
      }),
    }),
  }),
});

export const { useTestTransformerPlaybooksMutation } =
  testTransformerPlaybooksApi;
