import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import { store } from "../store/index.ts";
import getCurrentTask from "./getCurrentTask.ts";

export const constructBuilder = (id?: string) => {
  const [task] = getCurrentTask(id);
  const { supportedTaskTypes } = playbookSelector(store.getState());
  const source = task?.source ?? "";
  const taskType = task?.[source?.toLowerCase()].type;
  const type = supportedTaskTypes?.find(
    (e) => e.source === source && e.task_type === taskType,
  );

  if (!task) return {};

  return type.form_fields.map((field) => ({
    key: field.key_name,
    label: field.display_name,
    placeholder: field.description,
    options: field.valid_values?.map((v) => ({
      id: v[v.type.toLowerCase()],
      label: v[v.type.toLowerCase()],
    })),
    inputType: field.form_field_type,
    isOptional: field.is_optional,
    default: field.default_value?.[field.default_value.type.toLowerCase()],
  }));
};
