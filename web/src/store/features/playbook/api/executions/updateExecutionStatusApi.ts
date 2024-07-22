import { UPDATE_EXECUTION_STATUS } from "../../../../../constants/index.ts";
import { apiSlice } from "../../../../app/apiSlice.ts";

type UpdateExecutionStatusApiProps = {
  playbook_run_id: string;
  status?: string;
};

export const updateExecutionStatusApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateExecutionStatus: builder.mutation<any, UpdateExecutionStatusApiProps>(
      {
        query: ({ playbook_run_id, status = "FINISHED" }) => ({
          url: UPDATE_EXECUTION_STATUS,
          body: {
            playbook_run_id,
            status,
          },
          method: "POST",
        }),
      },
    ),
  }),
});

export const { useUpdateExecutionStatusMutation } = updateExecutionStatusApi;
