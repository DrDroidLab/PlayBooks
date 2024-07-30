import { CREATE_PLAYBOOK } from "../../../../constants/index.ts";
import { Playbook } from "../../../../types/playbooks/playbook.ts";
import { apiSlice } from "../../../app/apiSlice.ts";

export const createPlaybookApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPlaybook: builder.mutation<any, Playbook | null>({
      query: (body) => ({
        url: CREATE_PLAYBOOK,
        body: {
          playbook: body,
        },
        method: "POST",
      }),
      invalidatesTags: ["Playbooks"],
    }),
  }),
});

export const { useCreatePlaybookMutation } = createPlaybookApi;
