import { GET_ASSETS } from "../../../../../constants/index.ts";
import { updateCardByIndex } from "../../../../../utils/execution/updateCardByIndex.ts";
import getCurrentTask from "../../../../../utils/getCurrentTask.ts";
import { apiSlice } from "../../../../app/apiSlice.ts";
import { setAssets } from "../../playbookSlice.ts";

export const getAssetApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssets: builder.query<any, { filter: any }>({
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
      transformResponse: (response: any) => {
        const [task] = getCurrentTask();
        const data = response?.assets;
        if (data?.length === 0) return [];
        let connector_type = task.source;
        if (connector_type?.includes("_VPC"))
          connector_type = connector_type.replace("_VPC", "");

        const assets = data[0][connector_type.toLowerCase()].assets?.map(
          (e) => e[task.modelType.toLowerCase()],
        );

        return assets;
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          // Wait for the query to complete
          const { data } = await queryFulfilled;
          // Dispatch an action to update the global state
          dispatch(setAssets(data));

          const modelOptions = data.map((asset) => Object.values(asset)[0]);
          updateCardByIndex("modelOptions", modelOptions);
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
    }),
  }),
});

export const {
  endpoints: { getAssets },
} = getAssetApi;
