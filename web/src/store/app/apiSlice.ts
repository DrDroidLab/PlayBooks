import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauthAndModify } from "./query.ts";

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauthAndModify,
  endpoints: (_) => ({}),
  tagTypes: [
    "Integrations",
    "Playbooks",
    "Triggers",
    "API_Tokens",
    "Workflows",
  ],
});
