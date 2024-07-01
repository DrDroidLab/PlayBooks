import { useSelector } from "react-redux";
import {
  currentPlaybookSelector,
  playbookSelector,
} from "../store/features/playbook/playbookSlice.ts";
import { Task } from "../types/task.ts";

type UseCurrentTaskReturnType = [Task | undefined, string | undefined];

export default function useCurrentTask(id?: string): UseCurrentTaskReturnType {
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const { currentVisibleTask } = useSelector(playbookSelector);
  const tasks: Task[] = currentPlaybook?.ui_requirement.tasks ?? [];

  const currentId = id ?? currentVisibleTask;
  const task: Task | undefined = tasks?.find((task) => task.id === currentId);

  return [task, currentId];
}
