import { GET_BUILDER_OPTIONS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setPlaybookKey } from "../playbookSlice.ts";

export const playbookBuilderOptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    playbookBuilderOptions: builder.query<any, void>({
      query: () => ({
        url: GET_BUILDER_OPTIONS,
        method: "POST",
      }),
      transformResponse: (response) => {
        const data = response?.source_options;
        const connectorOptionsMap = data.reduce(
          (map, option) => ({
            ...map,
            [option.source.toLowerCase()]: option.connector_options,
          }),
          {},
        );

        const supportedTaskTypes: any[] = [];

        data.forEach((source) => {
          source.supported_task_type_options.forEach((taskTypeOption) => {
            supportedTaskTypes.push({
              source: source.source,
              ...taskTypeOption,
            });
          });
        });

        return {
          connectorOptionsMap,
          supportedTaskTypes,
        };
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setPlaybookKey({
              key: "connectorOptionsMap",
              value: data.connectorOptionsMap,
            }),
          );
          dispatch(
            setPlaybookKey({
              key: "supportedTaskTypes",
              value: data.supportedTaskTypes,
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

export const { usePlaybookBuilderOptionsQuery } = playbookBuilderOptionsApi;
