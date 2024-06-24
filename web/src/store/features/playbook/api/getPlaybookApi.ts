import { GET_PLAYBOOKS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setCurrentPlaybook, setPlaybookData } from "../playbookSlice.ts";

export const getPlaybookApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlaybook: builder.query<any, { playbookId: number }>({
      query: ({ playbookId }) => ({
        url: GET_PLAYBOOKS,
        body: {
          playbook_ids: [playbookId],
        },
        method: "POST",
      }),
      transformResponse: (response) => {
        return response?.playbooks[0];
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentPlaybook(data));
          dispatch(setPlaybookData(data));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
      providesTags: ["Playbooks"],
    }),
  }),
});

export const { useLazyGetPlaybookQuery } = getPlaybookApi;
