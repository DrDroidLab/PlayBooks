import { CREATE_PLAYBOOK } from "../../../../constants/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const createPlaybookApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPlaybook: builder.mutation<any, any>({
      query: (body) => ({
        url: CREATE_PLAYBOOK,
        body,
        method: "POST",
      }),
      invalidatesTags: ["Playbooks"],
    }),
  }),
});

export const { useCreatePlaybookMutation } = createPlaybookApi;
