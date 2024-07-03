import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../constants/index.ts";
import { rangeSelector } from "../features/timeRange/timeRangeSlice.ts";
import { showSnackbar } from "../features/snackbar/snackbarSlice.ts";
import { CustomError, ErrorType } from "../../utils/Error.ts";
import { refreshToken } from "./refreshTokenService.ts";
import { logOut } from "../features/auth/authSlice.ts";
import { isUnAuth } from "../../utils/auth/unauthenticatedRoutes.ts";

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

export const baseQueryWithReauthAndModify = async (args, api, extraOptions) => {
  const modifiedArgs = modifyRequestBody(args, api);
  let result: any = await baseQuery(modifiedArgs, api, extraOptions);

  if (result.error?.status === 401 && !isUnAuth) {
    try {
      const refreshResult = await refreshToken();
      const newAccessToken = refreshResult.data?.access;

      if (newAccessToken) {
        modifiedArgs.headers.set("Authorization", `Bearer ${newAccessToken}`);
        result = await baseQuery(modifiedArgs, api, extraOptions);
      }
    } catch (error) {
      api.dispatch(showSnackbar("Session expired. Please log in again."));
      api.dispatch(logOut());
      throw error;
    }
  }

  if (result.error?.status === 403) {
    api.dispatch(showSnackbar("This action not allowed on Sandbox."));
  }

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
