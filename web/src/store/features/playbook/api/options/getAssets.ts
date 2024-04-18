import { GET_ASSETS } from '../../../../../constants/index.ts';
import { AssetsResponse } from '../../../../../types';
import { apiSlice } from '../../../../app/apiSlice.ts';
import { setAssets } from '../../playbookSlice.ts';

export const getAssetApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAssets: builder.query<AssetsResponse, { filter: any; stepIndex: number }>({
      query: ({ filter, stepIndex }) => ({
        url: GET_ASSETS,
        method: 'POST',
        body: filter
      }),
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        try {
          // Wait for the query to complete
          const { data } = await queryFulfilled;
          if (data.assets.length === 0) return;
          let connector_type = args.filter.connector_type;
          if (connector_type?.includes('_VPC')) connector_type = connector_type.replace('_VPC', '');
          // Dispatch an action to update the global state
          dispatch(
            setAssets({
              assets:
                data?.assets[0][connector_type.toLowerCase()].assets[0][
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

export const { useLazyGetAssetsQuery } = getAssetApi;
