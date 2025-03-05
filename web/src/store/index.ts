import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./app/apiSlice.ts";
import authSlice from "./features/auth/authSlice.ts";
import playbookSlice from "./features/playbook/playbookSlice.ts";
import integrationsSlice from "./features/integrations/integrationsSlice.ts";
import timeRangeSlice from "./features/timeRange/timeRangeSlice.ts";
import snackbarSlice from "./features/snackbar/snackbarSlice.ts";
import workflowSlice from "./features/workflow/workflowSlice.ts";
import drawersSlice from "./features/drawers/drawersSlice.ts";
import fakeLoadingSlice from "./features/fakeLoading/fakeLoadingSlice.ts";
import searchSlice from "./features/search/searchSlice.ts";
import paginationSlice from "./features/pagination/paginationSlice.ts";
import commonSlice from "./features/common/commonSlice.ts";
import dynamicAlertsSlice from "./features/dynamicAlerts/dynamicAlertsSlice.ts";
import sidebarSlice from "./features/sidebar/sidebarSlice.ts";
import secretsSlice from "./features/secrets/secretsSlice.ts";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    timeRange: timeRangeSlice,
    auth: authSlice,
    playbook: playbookSlice,
    integrations: integrationsSlice,
    workflows: workflowSlice,
    snackbar: snackbarSlice,
    drawers: drawersSlice,
    fakeLoading: fakeLoadingSlice,
    search: searchSlice,
    pagination: paginationSlice,
    common: commonSlice,
    dynamicAlerts: dynamicAlertsSlice,
    sidebar: sidebarSlice,
    secerts: secretsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
