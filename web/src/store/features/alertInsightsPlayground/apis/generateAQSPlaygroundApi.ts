import { GENERATE_AQS_PLAYGROUND } from '../../../../constants/index.ts';
import { apiSlice } from '../../../app/apiSlice.ts';

const currentTimestamp = Math.floor(Date.now() / 1000);

export const generateAQSPlaygroundApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    generateAQSPlayground: builder.query<any, any>({
      query: ({ filter_channels }) => ({
        url: GENERATE_AQS_PLAYGROUND,
        method: 'POST',
        body: {
          filter_channels,
          meta: {
            time_range: { time_geq: currentTimestamp - 1209600, time_lt: currentTimestamp }
          }
        }
      }),
      transformResponse: response => {
        return {
          aqsScore: Math.floor(response?.aqs_score_models[0].aqs),
          channelData: response?.channel_aqs_data
            .map(channel => {
              return {
                channel_name: channel.channel_name,
                score: Math.floor(channel.aqs_score_models[0].aqs)
              };
            })
            .sort((a, b) => b.score - a.score),
          aqsScores: response.channel_aqs_data.map(channel => {
            return {
              channel: channel.channel_name,
              x: Math.floor(channel.aqs_score_models[0].score_a),
              y: Math.floor(channel.aqs_score_models[0].score_f)
            };
          })
        };
      }
    })
  })
});

export const { useGenerateAQSPlaygroundQuery } = generateAQSPlaygroundApi;
