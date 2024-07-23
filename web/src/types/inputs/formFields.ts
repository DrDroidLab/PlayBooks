import { InputType } from "./inputTypes.ts";

export type FormFields = {
  key_name: string;
  display_name: string;
  description: string;
  valid_values?: any[];
  form_field_type: InputType;
  is_optional?: boolean;
  default_value?: any;
};
