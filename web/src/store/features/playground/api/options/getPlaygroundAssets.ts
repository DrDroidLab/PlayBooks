import { GET_PLAYGROUND_ASSETS } from '../../../../../constants/api.ts';
import { AssetsResponse } from '../../../../../types.ts';
import { apiSlice } from '../../../../app/apiSlice.ts';
import { setAssets } from '../../playgroundSlice.ts';

export const getPlaygroundAssetApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getPlaygroundAssets: builder.query<AssetsResponse, { filter: any; stepIndex: number }>({
      query: ({ filter, stepIndex }) => ({
        url: GET_PLAYGROUND_ASSETS,
        method: 'POST',
        body: filter
      }),
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        try {
          // Wait for the query to complete
          const { data } = await queryFulfilled;
          // Dispatch an action to update the global state
          dispatch(
            setAssets({
              assets:
                data?.assets[0][args.filter.connector_type.toLowerCase()].assets[0][
                  args.filter.type.toLowerCase()
                ],
              index: args.stepIndex
            })
          );
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      }
    })
  })
});

export const { useLazyGetPlaygroundAssetsQuery } = getPlaygroundAssetApi;
