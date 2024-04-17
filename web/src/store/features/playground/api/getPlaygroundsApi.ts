import { GET_PLAYGROUNDS } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

export const getPlaygroundsApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getPlaygrounds: builder.query<any, void>({
      query: () => ({
        url: GET_PLAYGROUNDS,
        method: 'POST'
      })
    })
  })
});

export const { useGetPlaygroundsQuery } = getPlaygroundsApi;
