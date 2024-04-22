import { GET_TRIGGER_OPTIONS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getTriggerOptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTriggerOptions: builder.query<any, any>({
      query: () => ({
        url: GET_TRIGGER_OPTIONS,
        method: "POST",
        body: {
          connector_type_requests: [
            {
              connector_type: "SLACK",
            },
          ],
        },
      }),
      transformResponse: (response) => {
        if (response?.alert_ops_options?.comm_options?.workspaces?.length > 0)
          return response?.alert_ops_options?.comm_options?.workspaces[0];
        return [];
      },
    }),
  }),
});

export const { useGetTriggerOptionsQuery } = getTriggerOptionsApi;
