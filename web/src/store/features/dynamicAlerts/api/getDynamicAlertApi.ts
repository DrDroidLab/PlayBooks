import { GET_WORKFLOWS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setDynamicAlert } from "../dynamicAlertsSlice.ts";

export const getDynamicAlertApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDynamicAlert: builder.query<any, string>({
      query: (alertId) => ({
        url: GET_WORKFLOWS,
        method: "POST",
        body: {
          workflow_ids: [alertId],
        },
      }),
      transformResponse: (response) => {
        return response?.workflows[0];
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setDynamicAlert(data));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
      providesTags: ["Workflows"],
    }),
  }),
});

export const { useLazyGetDynamicAlertQuery } = getDynamicAlertApi;
