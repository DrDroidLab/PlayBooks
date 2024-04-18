import { createSlice } from '@reduxjs/toolkit';

type SourceType = {
  id: string;
  channel_connector_key_id: string;
  alert_type: string;
};

type ChannelType = {
  id: string;
  channel_id: string;
  channel_name: string;
};

type InitialStateType = {
  channel: ChannelType | null;
  source: SourceType | null;
  filterString: string;
  workspaceId: string;
  isPrefetched: boolean;
};

const initialState: InitialStateType = {
  channel: null,
  source: null,
  filterString: '',
  workspaceId: '',
  isPrefetched: false
};

const triggerSlice = createSlice({
  name: 'trigger',
  initialState,
  reducers: {
    setTrigger: (state, { payload }) => {
      state.workspaceId = payload?.connector?.id;
      state.channel = {
        id: payload?.definition?.slack_alert_playbook_trigger?.channel_connector_key_id,
        channel_name: payload?.definition?.slack_alert_playbook_trigger?.channel_name,
        channel_id: payload?.definition?.slack_alert_playbook_trigger?.channel_id
      };
      state.source = {
        id: payload?.definition?.slack_alert_playbook_trigger?.alert_type,
        channel_connector_key_id:
          payload?.definition?.slack_alert_playbook_trigger?.channel_connector_key_id,
        alert_type: payload?.definition?.slack_alert_playbook_trigger?.alert_type
      };
      state.filterString =
        payload?.definition?.slack_alert_playbook_trigger?.alert_title_filter_string;
      state.isPrefetched = true;
    },
    setWorkspaceId: (state, { payload }) => {
      state.workspaceId = payload;
    },
    setChannel: (state, { payload }) => {
      state.channel = payload;
    },
    setSource: (state, { payload }) => {
      state.source = payload;
    },
    setFilterString: (state, { payload }) => {
      state.filterString = payload;
    },
    resetTriggerState: state => {
      state.channel = null;
      state.source = null;
      state.filterString = '';
      state.workspaceId = '';
      state.isPrefetched = false;
    }
  }
});

export const {
  setTrigger,
  setWorkspaceId,
  setChannel,
  setSource,
  setFilterString,
  resetTriggerState
} = triggerSlice.actions;

export default triggerSlice.reducer;

export const triggerSelector = state => state.trigger;
