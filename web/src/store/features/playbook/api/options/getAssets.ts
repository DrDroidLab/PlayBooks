import { GET_ASSETS } from "../../../../../constants/index.ts";
import { AssetsResponse } from "../../../../../types";
import getCurrentTask from "../../../../../utils/getCurrentTask.ts";
import { apiSlice } from "../../../../app/apiSlice.ts";
import { setAssets } from "../../playbookSlice.ts";

export const getAssetApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssets: builder.query<AssetsResponse, { filter: any }>({
      query: ({ filter }) => {
        const [task] = getCurrentTask();
        return {
          url: GET_ASSETS,
          method: "POST",
          body: {
            connector_id: task?.connectorType,
            type: task?.modelType,
            filters: filter,
          },
        };
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          // Wait for the query to complete
          const [task] = getCurrentTask();
          const { data } = await queryFulfilled;
          if (data.assets.length === 0) return;
          let connector_type = task.source;
          if (connector_type?.includes("_VPC"))
            connector_type = connector_type.replace("_VPC", "");
          // Dispatch an action to update the global state
          dispatch(
            setAssets(
              data?.assets[0][connector_type.toLowerCase()].assets[0][
                task.modelType.toLowerCase()
              ],
            ),
          );
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
    }),
  }),
});

export const { useLazyGetAssetsQuery } = getAssetApi;
