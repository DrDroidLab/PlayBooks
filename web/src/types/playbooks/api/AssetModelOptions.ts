import { ModelTypesOption } from "../../index.ts";

export type AssetModelOptionsResponse = {
  success: boolean;
  asset_model_options: AssetModelOption[];
};

export type AssetModelOption = {
  connector_type: string;
  model_types_options: ModelTypesOption[];
};

export interface AssetModelOptionsRequest {
  connector_type: string;
  model_type?: string; // Optional depending on if you're targeting a specific model_type
}
