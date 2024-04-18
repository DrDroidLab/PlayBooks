import { GET_PLAYBOOKS } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';
import { setMeta, setPlaybooks } from '../playbookSlice.ts';

export const getPlaybooksApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getPlaybooks: builder.query<any, { limit: number; offset: number }>({
      query: ({ limit, offset }) => ({
        url: GET_PLAYBOOKS,
        body: {
          meta: {
            page: {
              limit,
              offset
            }
          }
        },
        method: 'POST'
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setPlaybooks(data.playbooks));
          dispatch(setMeta(data.meta));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
      providesTags: ['Playbooks']
    })
  })
});

export const { useGetPlaybooksQuery } = getPlaybooksApi;
