import { UPDATE_CONNECTOR_STATUS } from '../../../../constants/api.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

export const updateConnectorApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    updateConnector: builder.mutation<any, any>({
      query: ({ id, keys, type }) => ({
        url: UPDATE_CONNECTOR_STATUS,
        method: 'POST',
        body: {
          connector_id: id,
          connector: {
            type: type
          },
          update_connector_ops: [
            {
              op: 'UPDATE_CONNECTOR_KEYS',
              update_connector_keys: {
                connector_keys: keys
              }
            }
          ]
        }
      }),
      invalidatesTags: ['Integrations']
    })
  })
});

export const { useUpdateConnectorMutation } = updateConnectorApi;
