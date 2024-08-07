import { UPDATE_WORKFLOW } from "../../../../constants/index.ts";
import { stateToDynamicAlert } from "../../../../utils/parser/dynamicAlert/stateToDynamicAlert.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const updateDynamicAlertApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateDynamicAlert: builder.mutation<any, void>({
      query: () => {
        const workflow = stateToDynamicAlert();
        return {
          url: UPDATE_WORKFLOW,
          body: {
            workflow_id: workflow.id,
            update_workflow_ops: [
              {
                op: "UPDATE_WORKFLOW",
                update_workflow: {
                  workflow,
                },
              },
            ],
          },
          method: "POST",
        };
      },
      invalidatesTags: ["Workflows"],
    }),
  }),
});

export const { useUpdateDynamicAlertMutation } = updateDynamicAlertApi;
