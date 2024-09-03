import { GENERATE_ZENDUTY_WEBHOOK } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setCurrentWorkflowKey } from "../workflowSlice.ts";

export const generateZendutyWebHookApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateZendutyWebHook: builder.mutation<any, void>({
      query: () => ({
        url: GENERATE_ZENDUTY_WEBHOOK,
        method: "POST",
        body: {},
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

export const { useGenerateZendutyWebHookMutation } = generateZendutyWebHookApi;
