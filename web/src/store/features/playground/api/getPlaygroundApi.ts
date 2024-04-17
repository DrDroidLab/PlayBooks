import { GET_PLAYGROUNDS } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';
import { setPlayground } from '../playgroundSlice.ts';

export const getPlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getPlayground: builder.query<any, string>({
      query: playbookId => ({
        url: GET_PLAYGROUNDS,
        method: 'POST',
        body: {
          playbook_ids: [playbookId]
        }
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          // Wait for the query to complete
          const { data } = await queryFulfilled;
          // Dispatch an action to update the global state
          dispatch(setPlayground(data?.playbooks[0]));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      }
    })
  })
});

export const { useGetPlaygroundQuery } = getPlaygroundApi;
