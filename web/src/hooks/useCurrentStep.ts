import { useSelector } from "react-redux";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";

export default function useCurrentStep(index?: number, stepData?: any) {
  const { currentStepIndex, steps, connectorOptions } =
    useSelector(playbookSelector);

  // const currentTaskType = taskTypes?.find(
  //   (e) => e.task_type === id,
  // );

  const currentIndex = index ?? currentStepIndex;
  const step =
    steps.length > 0 && currentIndex !== null && currentIndex !== undefined
      ? steps[currentIndex]
      : {};
  const currentConnector = connectorOptions?.find(
    (e) => e.id === step?.source,
  )?.connector;

  const taskTypes = currentConnector?.supported_task_type_options ?? [];
  const taskType = taskTypes.find((e) => e.task_type === step.taskType);

  return [
    { ...(stepData ?? step), resultType: taskType?.result_type },
    currentIndex,
  ];
}
