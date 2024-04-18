import { GET_CONNECTOR_KEYS } from '../../../../constants/api.ts';
import { apiSlice } from '../../../app/apiSlice.ts';
import { setKey } from '../integrationsSlice.ts';

export const getConnectorKeysApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getConnectorKeys: builder.query<any, number>({
      query: id => ({
        url: GET_CONNECTOR_KEYS,
        method: 'POST',
        body: {
          connector_id: id
        }
      }),
      providesTags: ['Integrations'],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          data?.connector_keys?.forEach(key => {
            dispatch(setKey({ key: key.key_type, value: key.key }));
          });
        } catch (e) {
          console.log(e);
        }
      }
    })
  })
});

export const { useLazyGetConnectorKeysQuery } = getConnectorKeysApi;
