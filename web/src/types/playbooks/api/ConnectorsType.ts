import { ModelTypeMap } from "../../index.ts";

export type ConnectorsType = {
  id: string;
  label: string;
  connector_type: string;
  model_type: string;
  display_name: string;
};

export type ConnectorTypesResponse = {
  success: boolean;
  active_account_connectors: ConnectorType[];
};

export type ConnectorType = {
  connector_type: string;
  model_types_map: ModelTypeMap[];
};
