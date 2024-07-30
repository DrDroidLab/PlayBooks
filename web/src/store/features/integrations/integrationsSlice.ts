import { createSlice } from "@reduxjs/toolkit";
import capitalizeFirstLetter from "../../../utils/common/capitalize";
import { RootState } from "../..";

type InitialStateType = {
  allIntegrations: any;
  currentConnector: any;
  keyOptions: any;
  vpcConnectors: any;
  agentProxy: any;
  testData: any;
};

const initialState: InitialStateType = {
  allIntegrations: [],
  currentConnector: {},
  keyOptions: [],
  vpcConnectors: [],
  agentProxy: {},
  testData: {},
};

const integrationsSlice = createSlice({
  name: "integrations",
  initialState,
  reducers: {
    setIntegrations: (state, { payload }) => {
      state.allIntegrations = payload;
    },
    setVpcConnectors: (state, { payload }) => {
      state.vpcConnectors = payload;
    },
    setAgentProxy: (state, { payload }) => {
      state.agentProxy = payload;
    },
    setCurrentConnector: (state, { payload }) => {
      const connector = state.allIntegrations.find(
        (el) => el.enum.toLowerCase() === payload,
      );
      if (connector) {
        state.currentConnector = {
          ...connector,
          displayTitle: connector.title
            .split(" ")
            .map((e) => capitalizeFirstLetter(e.toLowerCase()))
            .join(" "),
        };
      }
    },
    setConnector(state, { payload }) {
      state.currentConnector = payload;
    },
    setKeysOptions: (state, { payload }) => {
      state.keyOptions = payload;
      payload?.forEach((el) => {
        state.currentConnector[el.key_type] = "";
      });
    },
    setAgentKeyOptions: (state, { payload }) => {
      state.agentProxy.keyOptions = payload;
      payload.forEach((el) => {
        state.agentProxy[el.key_type] = "";
      });
    },
    setKey(state, { payload }) {
      state.currentConnector[payload.key] = payload.value;
    },
    setAgentProxyKey(state, { payload }) {
      state.agentProxy[payload.key] = payload.value;
    },
    setTestConnectorData(state, { payload }) {
      state.testData = payload;
    },
    resetIntegrationState(state) {
      state.testData = {};
      state.currentConnector = {};
      state.agentProxy = {};
      state.keyOptions = {};
      state.vpcConnectors = {};
    },
  },
});

export const {
  setIntegrations,
  setVpcConnectors,
  setAgentProxy,
  setCurrentConnector,
  setConnector,
  setKeysOptions,
  setAgentKeyOptions,
  setKey,
  setAgentProxyKey,
  setTestConnectorData,
  resetIntegrationState,
} = integrationsSlice.actions;

export default integrationsSlice.reducer;

export const integrationsSelector = (state: RootState) =>
  state.integrations.allIntegrations;
export const connectorSelector = (state: RootState) =>
  state.integrations.currentConnector;
export const keyOptionsSelector = (state: RootState) =>
  state.integrations.keyOptions;
export const agentProxySelector = (state: RootState) =>
  state.integrations.agentProxy;
export const testDataSelector = (state: RootState) =>
  state.integrations.testData;
