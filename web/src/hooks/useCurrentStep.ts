import { useSelector } from "react-redux";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";

export default function useCurrentStep(id?: string, stepData?: any) {
  const { currentStepId, steps, connectorOptions } =
    useSelector(playbookSelector);

  const currentId = id ?? currentStepId;
  const step =
    steps.length > 0 && currentId
      ? steps.find((step) => step.id === currentId)
      : {};
  const currentConnector = connectorOptions?.find(
    (e) => e.id === step?.source,
  )?.connector;

  const taskTypes = currentConnector?.supported_task_type_options ?? [];
  const taskType = taskTypes.find((e) => e.task_type === step.taskType);

  return [
    { ...(stepData ?? step), resultType: taskType?.result_type },
    currentId,
  ];
}
