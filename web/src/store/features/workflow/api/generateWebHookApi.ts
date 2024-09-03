import { apiSlice } from "../../../app/apiSlice.ts";
import { setCurrentWorkflowKey } from "../workflowSlice.ts";

export const generateWebhookApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateWebhook: builder.mutation<
      any,
      { workflow_name: string; tool_name: string }
    >({
      query: ({ workflow_name, tool_name }) => ({
        url: `/connectors/handlers/${tool_name}/generate/webhook`,
        method: "POST",
        body: {
          workflow_name,
        },
        responseHandler: "text",
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCurrentWorkflowKey({
              key: "webhook",
              value: data,
            }),
          );
        } catch (e) {
          console.log(e);
        }
      },
    }),
  }),
});

export const { useGenerateWebhookMutation } = generateWebhookApi;
