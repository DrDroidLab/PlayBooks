import { SEARCH_OPTIONS } from "../../../../constants/index.ts";
import handleOptions from "../../../../utils/search/handleOptions.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setOptions } from "../searchSlice.ts";

export const searchOptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchOptions: builder.query<any, string>({
      query: (context) => ({
        url: SEARCH_OPTIONS,
        method: "POST",
        body: {
          context: context,
        },
      }),
      transformResponse: (response: any) => {
        return (
          response?.column_options?.flatMap(
            (col) =>
              col.options?.flatMap((option) => handleOptions(col, option)) ??
              [],
          ) ?? []
        );
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setOptions(data));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
    }),
  }),
});

export const { useSearchOptionsQuery } = searchOptionsApi;
