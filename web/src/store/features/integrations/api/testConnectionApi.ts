import { TEST_CONNECTION } from '../../../../constants/api.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

export const testConnectionApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    testConnection: builder.query<any, any>({
      query: ({ keys, type }) => ({
        url: TEST_CONNECTION,
        method: 'POST',
        body: {
          connector: {
            type: type
          },
          connector_keys: keys
        }
      })
    })
  })
});

export const { useLazyTestConnectionQuery } = testConnectionApi;
