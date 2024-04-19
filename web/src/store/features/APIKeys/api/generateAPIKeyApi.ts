import { CREATE_API_TOKEN } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const generateAPIKeyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateAPIKey: builder.mutation<any, void>({
      query: () => ({
        url: CREATE_API_TOKEN,
        method: "POST",
      }),
      invalidatesTags: ["API_Tokens"],
    }),
  }),
});

export const { useGenerateAPIKeyMutation } = generateAPIKeyApi;
