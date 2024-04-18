import { GET_CONNECTOR_OPTIONS } from '../../../../constants/api.ts';
import { apiSlice } from '../../../app/apiSlice.ts';
import { setKeysOptions } from '../integrationsSlice.ts';

export const getConnectorKeyOptionsApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getConnectorKeyOptions: builder.query<any, string>({
      query: connectorType => ({
        url: GET_CONNECTOR_OPTIONS,
        method: 'POST',
        body: {
          connector_type: connectorType
        }
      }),
      providesTags: ['Integrations'],
      transformResponse: (response: any) => {
        return response?.connector_key_options ?? [];
      },
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setKeysOptions(data));
        } catch (e) {
          console.log(e);
        }
      }
    })
  })
});

export const { useLazyGetConnectorKeyOptionsQuery } = getConnectorKeyOptionsApi;
