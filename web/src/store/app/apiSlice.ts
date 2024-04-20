import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../constants/index.ts";
import { rangeSelector } from "../features/timeRange/timeRangeSlice.ts";
import { showSnackbar } from "../features/snackbar/snackbarSlice.ts";
import { CustomError, ErrorType } from "../../utils/Error.ts";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

const modifyRequestBody = (originalArgs, api) => {
  if (
    originalArgs.method?.toUpperCase() === "POST" &&
    typeof originalArgs.body === "object"
  ) {
    const modifiedArgs = { ...originalArgs };
    const timeRange = rangeSelector(api.getState());
    modifiedArgs.body = {
      ...originalArgs.body,
      meta: {
        time_range: timeRange,
        ...originalArgs.body.meta,
      },
    };
    return modifiedArgs;
  }
  return originalArgs;
};

const baseQueryWithReauthAndModify = async (args, api, extraOptions) => {
  const modifiedArgs = modifyRequestBody(args, api);

  let result: any = await baseQuery(modifiedArgs, api, extraOptions);

  // if (result.error?.status === 401) {
  //   // Try to refresh the token
  //   const refreshResult = await api.dispatch(refreshToken());

  //   if (refreshResult.type.endsWith("fulfilled")) {
  //     result = await baseQuery(modifiedArgs, api, extraOptions);
  //   } else {
  //     api.dispatch(redirectToLogin());
  //     throw new CustomError(
  //       "Session expired. Please login again.",
  //       ErrorType.AUTHENTICATION,
  //     );
  //   }
  // }

  if (result?.error?.originalStatus === 502) {
    const retryCount = extraOptions?.retryCount || 0;
    if (retryCount < 3) {
      return baseQueryWithReauthAndModify(args, api, {
        ...extraOptions,
        retryCount: retryCount + 1,
      });
    } else {
      const message = result.data?.message?.description || "There was an error";
      api.dispatch(showSnackbar(message));
      throw new CustomError(message, ErrorType.GENERAL);
    }
  }

  if (result.data?.hasOwnProperty("success") && !result.data?.success) {
    const message =
      result.data?.message?.description ||
      result?.data?.task_execution_result?.error ||
      result?.data?.message?.title ||
      "There was an error";
    api.dispatch(showSnackbar(message));
    if (result?.data?.task_execution_result?.error) {
      throw new CustomError(message, ErrorType.TASK_FAILED);
    } else throw new CustomError(message, ErrorType.GENERAL);
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauthAndModify,
  endpoints: (_) => ({}),
  tagTypes: ["Integrations", "Playbooks", "Triggers", "API_Tokens"],
});
