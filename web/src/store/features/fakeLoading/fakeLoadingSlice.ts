import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../..";

type FakeLoadingStateType = {
  isLoading: boolean;
  title?: string;
};

const initialState: FakeLoadingStateType = {
  isLoading: false,
  title: undefined,
};

const fakeLoadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    startFakeLoading: (state, { payload }) => {
      state.isLoading = true;
      state.title = payload;
    },
    stopFakeLoading: (state) => {
      state.isLoading = false;
      state.title = undefined;
    },
  },
});

export const { startFakeLoading, stopFakeLoading } = fakeLoadingSlice.actions;

export default fakeLoadingSlice.reducer;

export const fakeLoadingSelector = (state: RootState) =>
  state.fakeLoading.isLoading;
