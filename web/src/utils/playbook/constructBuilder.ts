import { playbookSelector } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import { FormFields } from "../../types/inputs/formFields.ts";
import { Sources } from "../../types/playbooks/sources.ts";
import extractOptions from "./extractOptions.ts";
import getCurrentTask from "./task/getCurrentTask.ts";
import { KeyType } from "./key.ts";
import extractHandleChange from "./extractHandleChange.ts";
import { Task } from "../../types/index.ts";
import { HandleInputRenderType } from "../../components/Inputs/HandleInputRender.tsx";
import handleInputType from "./handleInputType.ts";
import { commonKeySelector } from "../../store/features/common/commonSlice.ts";

const fieldToInput = (field: FormFields, task: Task): HandleInputRenderType => {
  const handleChangeFunction = extractHandleChange(
    task,
    field.key_name as KeyType,
  );
  return {
    key: field.key_name,
    label: field.display_name,
    placeholder: field.description,
    options:
      field.valid_values?.map((v) => ({
        id: v[v.type.toLowerCase()],
        label: v[v.type.toLowerCase()],
      })) ?? extractOptions(field.key_name as KeyType, task),
    inputType: field.form_field_type,
    type: handleInputType(field.data_type),
    isOptional: field.is_optional,
    default: field.default_value?.[field.default_value.type.toLowerCase()],
    handleChange: handleChangeFunction,
    compositeFields: field.composite_fields?.map((f) => fieldToInput(f, task)),
    value: undefined,
  };
};

export const constructBuilder = (id?: string) => {
  const [task] = getCurrentTask(id);
  if (!task) return [];
  const { supportedTaskTypes } = commonKeySelector(store.getState());
  const source: Sources = task.source.toLowerCase() as Sources;
  const taskType = (task as any)[source].type;
  const type = supportedTaskTypes?.find(
    (e: any) => e.source === source.toUpperCase() && e.task_type === taskType,
  );

  return type.form_fields.map((field: FormFields) => fieldToInput(field, task));
};
