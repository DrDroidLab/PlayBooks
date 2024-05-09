import { GET_BUILDER_OPTIONS } from "../../../../../constants/index.ts";
import { apiSlice } from "../../../../app/apiSlice.ts";
import { setPlaybookKey } from "../../playbookSlice.ts";

export const getBuilderOptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBuilderOptions: builder.query<any, void>({
      query: () => ({
        url: GET_BUILDER_OPTIONS,
        method: "POST",
        body: {},
      }),
      transformResponse: (response: any) => {
        return response?.interpreter_types;
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setPlaybookKey({ key: "interpreterTypes", value: data }));
        } catch (error) {
          console.log(error);
        }
      },
    }),
  }),
});

export const { useGetBuilderOptionsQuery } = getBuilderOptionsApi;
