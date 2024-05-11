import { GET_ASSET_MODEL_OPTIONS } from "../../../../../constants/index.ts";
import { AssetModelOptionsResponse } from "../../../../../types";
import { apiSlice } from "../../../../app/apiSlice.ts";
import { setModelTypeOptions } from "../../playbookSlice.ts";

export const getAssetModelOptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssetModelOptions: builder.query<
      AssetModelOptionsResponse,
      { connector_type: string; model_type: string; stepIndex: number }
    >({
      query: ({ connector_type, model_type, stepIndex }) => ({
        url: GET_ASSET_MODEL_OPTIONS,
        method: "POST",
        body: {
          connector_type,
          model_type,
        },
      }),
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        try {
          // Wait for the query to complete
          const { data } = await queryFulfilled;
          // Dispatch an action to update the global state
          if (data.asset_model_options?.length > 0)
            dispatch(
              setModelTypeOptions({
                options: data?.asset_model_options,
                index: args?.stepIndex,
              }),
            );
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
    }),
  }),
});

export const {
  useLazyGetAssetModelOptionsQuery,
  endpoints: { getAssetModelOptions },
} = getAssetModelOptionsApi;
