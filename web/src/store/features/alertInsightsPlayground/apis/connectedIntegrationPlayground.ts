import { GET_CONNECTED_INTEGRATION_PLAYGROUND } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

export const getConnectedIntegrationPlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getConnectedIntegrationPlayground: builder.query<any, any>({
      query: () => ({
        url: GET_CONNECTED_INTEGRATION_PLAYGROUND,
        method: 'POST'
      })
    })
  })
});

export const { useGetConnectedIntegrationPlaygroundQuery } = getConnectedIntegrationPlaygroundApi;
