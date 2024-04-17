import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './app/apiSlice.ts';
import authSlice from './features/auth/authSlice.ts';
import playbookSlice from './features/playbook/playbookSlice.ts';
import playgroundSlice from './features/playground/playgroundSlice.ts';
import integrationsSlice from './features/integrations/integrationsSlice.ts';
import alertInsightsPlaygroundSlice from './features/alertInsightsPlayground/alertInsightsPlaygroundSlice.ts';
import timeRangeSlice from './features/timeRange/timeRangeSlice.ts';
import triggerSlice from './features/triggers/triggerSlice.ts';
import snackbarSlice from './features/snackbar/snackbarSlice.ts';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    timeRange: timeRangeSlice,
    auth: authSlice,
    playbook: playbookSlice,
    playground: playgroundSlice,
    integrations: integrationsSlice,
    alertInghtsPlayground: alertInsightsPlaygroundSlice,
    trigger: triggerSlice,
    snackbar: snackbarSlice
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware)
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
