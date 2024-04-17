import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedActiveChannels: [],
  selectedAlertTypes: []
};

const alertInsightsPlaygroundSlice = createSlice({
  name: 'alertInsightsPlayground',
  initialState,
  reducers: {
    setSelectedActiveChannels: (state, { payload }) => {
      state.selectedActiveChannels = payload;
    },
    setSelectedAlertTypes: (state, { payload }) => {
      state.selectedAlertTypes = payload;
    }
  }
});

export const { setSelectedActiveChannels, setSelectedAlertTypes } =
  alertInsightsPlaygroundSlice.actions;

export default alertInsightsPlaygroundSlice.reducer;

export const selectedActiveChannelsSelector = state =>
  state?.alertInghtsPlayground?.selectedActiveChannels;
export const selectedAlertTypesSelector = state => state?.alertInghtsPlayground?.selectedAlertTypes;
