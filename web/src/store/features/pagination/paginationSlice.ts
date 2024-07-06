import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index.ts";

export const PaginationKeys = {
  PAGE: "page",
  LIMIT: "limit",
} as const;

type PaginationKeyType = (typeof PaginationKeys)[keyof typeof PaginationKeys];

type PaginationType = {
  [PaginationKeys.PAGE]: number;
  [PaginationKeys.LIMIT]: number;
};

const initialState: PaginationType = {
  [PaginationKeys.PAGE]: 0,
  [PaginationKeys.LIMIT]: 10,
};

type PaginationKeyAction = {
  key: PaginationKeyType;
  value: number;
};

const paginationSlice = createSlice({
  name: "pagination",
  initialState,
  reducers: {
    setPaginationKey: (state, action: PayloadAction<PaginationKeyAction>) => {
      state[action.payload.key] = action.payload.value;
    },
    resetPagination: (state) => {
      Object.values(PaginationKeys).forEach(
        (key) => (state[key] = initialState[key]),
      );
    },
  },
});

export const { setPaginationKey, resetPagination } = paginationSlice.actions;

export default paginationSlice.reducer;

export const paginationSelector = (state: RootState) => state.pagination;
