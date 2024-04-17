import { EXECUTE_TASK } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

export const executePlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    executePlayground: builder.mutation<any, any>({
      query: body => ({
        url: EXECUTE_TASK,
        method: 'POST',
        body
      })
    })
  })
});

export const { useExecutePlaygroundMutation } = executePlaygroundApi;
