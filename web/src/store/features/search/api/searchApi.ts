import { SEARCH } from "../../../../constants/index.ts";
import handleOptionType from "../../../../utils/search/handleOptionType.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const searchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query<
      any,
      { limit: number; offset: number; context: string; selected: any[] }
    >({
      query: ({ limit, offset, context, selected }) => {
        return {
          url: SEARCH,
          method: "POST",
          body: {
            context,
            query: {
              filter: {
                op: "OR",
                filters: selected?.map((el) => ({
                  op: "EQ",
                  lhs: {
                    column_identifier: {
                      name: el.column.name,
                      type: el.column.type,
                    },
                  },
                  rhs: {
                    literal: handleOptionType(el.option),
                  },
                })),
              },
            },
            meta: {
              page: {
                limit,
                offset,
              },
            },
          },
        };
      },
      transformResponse: (response: any, _, args) => {
        return {
          [args.context.toLowerCase()]:
            response?.[args.context.toLowerCase()]?.results ?? [],
          meta: response?.meta,
        };
      },
    }),
  }),
});

export const { useSearchQuery } = searchApi;
