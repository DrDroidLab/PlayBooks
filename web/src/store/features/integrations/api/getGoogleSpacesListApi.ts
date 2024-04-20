import { CREATE_CONNECTOR_STATUS } from "../../../../constants/api.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const getGoogleSpacesListApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGoogleSpacesList: builder.query<any, any>({
      query: () => ({
        url: CREATE_CONNECTOR_STATUS,
        method: "POST",
      }),
    }),
  }),
});

export const { useGetGoogleSpacesListQuery } = getGoogleSpacesListApi;
