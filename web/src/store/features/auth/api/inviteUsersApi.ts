import { GET_ACCOUNT_USERS } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const inviteUsersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    inviteUsers: builder.mutation<any, any>({
      query: ({ emailList }) => ({
        url: GET_ACCOUNT_USERS,
        method: "POST",
        body: {
          emails: emailList,
          signup_domain: window.location.hostname,
        },
      }),
    }),
  }),
});

export const { useInviteUsersMutation } = inviteUsersApi;
