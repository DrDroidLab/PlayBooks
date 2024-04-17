import { GET_PLAYGROUND_ASSET_MODEL_OPTIONS } from '../../../../../constants/index.ts';
import { AssetModelOptionsResponse } from '../../../../../types.ts';
import { apiSlice } from '../../../../app/apiSlice.ts';
import { setModelTypeOptions } from '../../playgroundSlice.ts';

export const getPlaygroundAssetModelOptionsApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getPlaygroundAssetModelOptions: builder.query<
      AssetModelOptionsResponse,
      { connector_type: string; model_type: string; stepIndex: number }
    >({
      query: body => ({
        url: GET_PLAYGROUND_ASSET_MODEL_OPTIONS,
        method: 'POST',
        body: body
      }),
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        try {
          // Wait for the query to complete
          const { data } = await queryFulfilled;
          // Dispatch an action to update the global state
          dispatch(
            setModelTypeOptions({ options: data?.asset_model_options, index: args?.stepIndex })
          );
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      }
    })
  })
});

export const {
  useLazyGetPlaygroundAssetModelOptionsQuery,
  endpoints: { getPlaygroundAssetModelOptions }
} = getPlaygroundAssetModelOptionsApi;
