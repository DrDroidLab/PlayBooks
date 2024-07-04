import { GET_CONNECTOR_OPTIONS } from "../../../../constants/index.ts";
import handleDefaultValues from "../../../../utils/handleDefaultValues.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { setKeysOptions } from "../integrationsSlice.ts";

export const getConnectorKeyOptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConnectorKeyOptions: builder.query<any, string>({
      query: (connectorType) => ({
        url: GET_CONNECTOR_OPTIONS,
        method: "POST",
        body: {
          connector_type: connectorType.toUpperCase(),
        },
      }),
      providesTags: ["Integrations"],
      transformResponse: (response: any) => {
        return response?.connector ?? [];
      },
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setKeysOptions(data?.keys));
          data?.keys?.forEach((e) => {
            handleDefaultValues(e);
          });
        } catch (e) {
          console.log(e);
        }
      },
    }),
  }),
});

export const {
  useLazyGetConnectorKeyOptionsQuery,
  useGetConnectorKeyOptionsQuery,
} = getConnectorKeyOptionsApi;
