import { HandleInputRenderType } from "../../components/Inputs/HandleInputRender";
import { store } from "../../store";
import { commonKeySelector } from "../../store/features/common/selectors";
import { FormFields } from "../../types/inputs/formFields";
import handleInputType from "../playbook/handleInputType";

const fieldToInput = (field: FormFields): HandleInputRenderType => {
  return {
    key: field.key_name,
    label: field.display_name,
    placeholder: field.description,
    options: field.valid_values?.map((v) => ({
      id: v[v.type.toLowerCase()],
      label: v[v.type.toLowerCase()],
    })),
    inputType: field.form_field_type,
    type: handleInputType(field.data_type),
    isOptional: field.is_optional,
    default: field.default_value?.[field.default_value.type.toLowerCase()],
    compositeFields: field.composite_fields?.map((f) => fieldToInput(f)),
    value: undefined,
  };
};

export const constructBuilder = () => {
  const { supportedTaskTypes } = commonKeySelector(store.getState());
  const source = "";
  const taskType = "";
  const type = supportedTaskTypes?.find(
    (e: any) => e.source === source.toUpperCase() && e.task_type === taskType,
  );

  return type?.form_fields.map((field: FormFields) => fieldToInput(field));
};
