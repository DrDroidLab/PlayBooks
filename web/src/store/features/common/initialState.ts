export type InitialStateType = {
  connectorOptionsMap?: any;
  connectorOptions?: any[];
  supportedTaskTypes?: any[];
  interpreterTypes?: any[];
};

export const initialState: InitialStateType = {
  connectorOptionsMap: {},
  connectorOptions: [],
  supportedTaskTypes: [],
  interpreterTypes: [],
};
