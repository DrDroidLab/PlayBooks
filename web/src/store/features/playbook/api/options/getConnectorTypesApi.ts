import { GET_CONNECTORS } from '../../../../../constants/index.ts';
import { ConnectorTypesResponse, ConnectorsType } from '../../../../../types';
import { apiSlice } from '../../../../app/apiSlice.ts';

export const getConnectorTypesApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getConnectorTypes: builder.query<ConnectorsType[], void>({
      query: () => ({
        url: GET_CONNECTORS,
        method: 'POST',
        body: {}
      }),
      transformResponse: (response: ConnectorTypesResponse, meta, arg) => {
        const options: ConnectorsType[] = [];
        for (let connector of response.active_account_connectors) {
          for (let k = 0; k < connector.model_types_map?.length; k++) {
            options.push({
              id: `${connector.connector_type} ${connector.model_types_map[k].display_name}`,
              label: `${connector.connector_type} ${connector.model_types_map[k].display_name}`,
              connector_type: connector.connector_type,
              model_type: connector.model_types_map[k].model_type
            });
          }
        }
        return options;
      }
    })
  })
});

export const { useGetConnectorTypesQuery, useLazyGetConnectorTypesQuery } = getConnectorTypesApi;
