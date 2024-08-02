import { CREATE_DYNAMIC_ALERTS } from "../../../../constants/index.ts";
import { stateToDynamicAlert } from "../../../../utils/parser/dynamicAlert/stateToDynamicAlert.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const createDynamicAlertApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createWorkflow: builder.mutation<any, void>({
      query: () => ({
        url: CREATE_DYNAMIC_ALERTS,
        body: stateToDynamicAlert(),
        method: "POST",
      }),
      invalidatesTags: ["Workflows"],
    }),
  }),
});

export const { useCreateWorkflowMutation } = createDynamicAlertApi;
