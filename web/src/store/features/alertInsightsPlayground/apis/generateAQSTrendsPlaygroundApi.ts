import { GENERATE_AQS_TRENDS_PLAYGROUND } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

export const generateAQSTrendsPlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    generateAQSTrendsPlayground: builder.query<any, any>({
      query: ({ filter_channels }) => ({
        url: GENERATE_AQS_TRENDS_PLAYGROUND,
        method: 'POST',
        body: {
          filter_channels
        }
      }),
      transformResponse: response => {
        const trendDates = response?.channel_aqs_data[0].aqs_score_models
          .map(x => {
            return new Date(parseInt(x['timestamp'], 10) * 1000).toISOString().split('T')[0];
          })
          .reverse();
        const trendSeries = response?.channel_aqs_data.map(x => {
          return {
            name: x['channel_name'],
            data: x['aqs_score_models']
              .map(x => {
                return parseInt(x['aqs']);
              })
              .reverse()
          };
        });

        return { dates: trendDates, series: trendSeries };
      }
    })
  })
});

export const { useGenerateAQSTrendsPlaygroundQuery } = generateAQSTrendsPlaygroundApi;
