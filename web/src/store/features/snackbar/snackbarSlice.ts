// features/snackbar/snackbarSlice.js
import { createSlice } from "@reduxjs/toolkit";

export const snackbarSlice = createSlice({
  name: "snackbar",
  initialState: {
    open: false,
    message: "",
    type: "error",
  },
  reducers: {
    showSnackbar: (state, { payload }) => {
      state.open = true;
      state.message = payload.message ?? payload;
      state.type = payload?.type ?? "error";
    },
    hideSnackbar: (state) => {
      state.open = false;
      state.message = "";
    },
  },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;

export default snackbarSlice.reducer;

export const snackbarSelector = (state) => state.snackbar;
