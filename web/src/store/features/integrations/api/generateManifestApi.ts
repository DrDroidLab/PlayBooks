import { GENERATE_MANIFEST } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setKey } from "../integrationsSlice.ts";

export const generateManifestApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateManifest: builder.mutation<any, void>({
      query: () => ({
        url: GENERATE_MANIFEST,
        method: "POST",
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          dispatch(
            setKey({
              key: "manifest",
              value: undefined,
            }),
          );
          const { data } = await queryFulfilled;
          dispatch(
            setKey({
              key: "manifest",
              value: data.app_manifest,
            }),
          );
        } catch (e) {
          console.log(e);
        }
      },
    }),
  }),
});

export const { useGenerateManifestMutation } = generateManifestApi;
