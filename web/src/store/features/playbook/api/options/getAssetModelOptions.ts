import { GET_ASSET_MODEL_OPTIONS } from "../../../../../constants/index.ts";
import { AssetModelOptionsResponse } from "../../../../../types";
import getCurrentTask from "../../../../../utils/getCurrentTask.ts";
import { apiSlice } from "../../../../app/apiSlice.ts";
import { setModelTypeOptions } from "../../playbookSlice.ts";

export const getAssetModelOptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssetModelOptions: builder.query<AssetModelOptionsResponse, void>({
      query: () => {
        const [task] = getCurrentTask();
        return {
          url: GET_ASSET_MODEL_OPTIONS,
          method: "POST",
          body: {
            connector_type: task.source,
            model_type: task.modelType,
          },
        };
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          // Wait for the query to complete
          const { data } = await queryFulfilled;
          // Dispatch an action to update the global state
          if (data.asset_model_options?.length > 0)
            dispatch(setModelTypeOptions(data?.asset_model_options));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
    }),
  }),
});

export const {
  endpoints: { getAssetModelOptions },
} = getAssetModelOptionsApi;
