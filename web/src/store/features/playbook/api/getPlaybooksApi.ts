import { GET_PLAYBOOKS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setPlaybooks } from "../playbookSlice.ts";

export const getPlaybooksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlaybooks: builder.query<any, void>({
      query: () => ({
        url: GET_PLAYBOOKS,
        body: {
          meta: {
            page: {
              limit: 1000,
            },
          },
        },
        method: "POST",
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setPlaybooks(data.playbooks));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
      providesTags: ["Playbooks"],
    }),
  }),
});

export const { useGetPlaybooksQuery } = getPlaybooksApi;
