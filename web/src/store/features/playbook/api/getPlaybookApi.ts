import { GET_PLAYBOOKS } from "../../../../constants/index.ts";
import { Playbook } from "../../../../types/index.ts";
import playbookToState from "../../../../utils/parser/playbook/playbookToState.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setPlaybookDataBeta } from "../playbookSlice.ts";

export const getPlaybookApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlaybook: builder.query<Playbook, { playbookId: number }>({
      query: ({ playbookId }) => ({
        url: GET_PLAYBOOKS,
        body: {
          playbook_ids: [playbookId],
        },
        method: "POST",
      }),
      transformResponse: (response) => {
        const playbook: Playbook = response?.playbooks?.[0] ?? {};
        return playbookToState(playbook);
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setPlaybookDataBeta(data));
        } catch (error) {
          console.log(error);
        }
      },
      providesTags: ["Playbooks"],
    }),
  }),
});

export const { useLazyGetPlaybookQuery } = getPlaybookApi;
