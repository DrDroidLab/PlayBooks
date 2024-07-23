import { taskTypes } from "../constants/index.ts";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import { store } from "../store/index.ts";
import * as Builders from "./builders/index.ts";
import getCurrentTask from "./getCurrentTask.ts";

export const constructBuilder = (id?: string) => {
  const [task, currentStepId] = getCurrentTask(id);
  const { supportedTaskTypes } = playbookSelector(store.getState());
  const source = task?.source ?? "";
  const taskType = task?.[source?.toLowerCase()].type;
  const type = supportedTaskTypes?.find(
    (e) => e.source === source && e.task_type === taskType,
  );
  console.log("type", type);

  if (!task) return {};

  return type.form_fields.map((field) => ({
    key: field.key_name,
    label: field.display_name,
    placeholder: field.description,
    options: field.valid_values,
  }));
};
