import { GOOGLE_SPACES_REGISTER } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const registerGoogleSpacesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerGoogleSpaces: builder.mutation<any, any>({
      query: ({ spaces }) => ({
        url: GOOGLE_SPACES_REGISTER,
        method: "POST",
        body: {
          spaces,
        },
      }),
    }),
  }),
});

export const { useRegisterGoogleSpacesMutation } = registerGoogleSpacesApi;
