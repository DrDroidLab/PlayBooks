import { GET_TEMPLATES } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getTemplatesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<any, void>({
      query: () => ({
        url: GET_TEMPLATES,
        method: "GET",
      }),
      transformResponse: (response) => {
        return response?.data;
      },
      providesTags: ["Templates"],
    }),
  }),
});

export const { useGetTemplatesQuery } = getTemplatesApi;
