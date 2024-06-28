import { useSelector } from "react-redux";
import {
  currentPlaybookSelector,
  playbookSelector,
} from "../store/features/playbook/playbookSlice.ts";

export default function useCurrentStep(id?: string, stepData?: any) {
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const { currentVisibleTask } = useSelector(playbookSelector);
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];

  const currentId = id ?? currentVisibleTask;
  const task = tasks?.find((task) => task.id === currentId);
  // const currentConnector = connectorOptions?.find(
  //   (e) => e.id === task?.source,
  // )?.connector;

  // const taskTypes = currentConnector?.supported_task_type_options ?? [];
  // const taskType = taskTypes.find(
  //   (e) => e.task_type === task?.ui_requirement.taskType,
  // );

  return [
    {
      ...(stepData ?? task),
      // resultType: taskType?.result_type
    },
    currentId,
  ];
}
