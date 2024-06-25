import { GENERATE_CURL } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setCurrentWorkflowKey } from "../workflowSlice.ts";

export const generateCurlApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateCurl: builder.mutation<any, void>({
      query: () => ({
        url: GENERATE_CURL,
        method: "POST",
        responseHandler: "text",
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCurrentWorkflowKey({
              key: "curl",
              value: data,
            })
          );
        } catch (e) {
          console.log(e);
        }
      },
    }),
  }),
});

export const { useGenerateCurlMutation } = generateCurlApi;
