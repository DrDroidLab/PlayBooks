import { SEARCH_TRIGGER } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { store } from "../../../index.ts";
import { currentWorkflowSelector } from "../../workflow/workflowSlice.ts";

const currentTimestamp = Math.floor(Date.now() / 1000);

export const searchTriggerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSearchTriggers: builder.query<any, void>({
      query: () => {
        const currentWorkflow = currentWorkflowSelector(store.getState());
        const workspace_id = currentWorkflow?.trigger?.workspaceId;
        const channel_id = currentWorkflow?.trigger?.channel?.channel_id;
        const alert_type = currentWorkflow?.trigger?.source;
        const filter_string = currentWorkflow?.trigger?.filterString;
        return {
          url: SEARCH_TRIGGER,
          method: "POST",
          body: {
            meta: {
              page: {
                limit: 5,
                offset: 0,
              },
              time_range: {
                time_geq: currentTimestamp - 259200,
                time_lt: currentTimestamp,
              },
            },
            workspace_id,
            channel_id,
            alert_type,
            pattern: filter_string,
          },
        };
      },
      transformResponse: (response: any) => {
        const data = {
          alerts: response?.slack_alerts ?? [],
          total: response?.meta?.total_count ?? 0,
        };
        return data;
      },
    }),
  }),
});

export const { useGetSearchTriggersQuery } = searchTriggerApi;
