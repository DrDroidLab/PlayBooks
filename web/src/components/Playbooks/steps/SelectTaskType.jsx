import React from "react";
import SelectComponent from "../../SelectComponent";
import { useSelector } from "react-redux";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import { updateCardById } from "../../../utils/execution/updateCardById.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function SelectTaskType({ id }) {
  const { connectorOptions } = useSelector(playbookSelector);
  const [step, currentId] = useCurrentStep(id);
  const isPrefetched = useIsPrefetched();
  const currentConnector = connectorOptions?.find(
    (e) => e.id === step?.source,
  )?.connector;

  const taskTypes = currentConnector?.supported_task_type_options ?? [];

  function handleTaskTypeChange(id, val) {
    const currentTaskType = currentConnector?.supported_task_type_options?.find(
      (e) => e.task_type === id,
    );
    const modelType =
      currentTaskType.supported_model_types?.length > 0
        ? currentTaskType.supported_model_types[0].model_type
        : currentConnector.source;
    updateCardById("modelType", modelType, currentId);
    updateCardById("taskType", id, currentId);
    updateCardById("resultType", currentTaskType.result_type, currentId);
    if (!step.userEnteredDescription)
      updateCardById("description", val.type.display_name, currentId);
  }

  return (
    <div className="flex flex-col">
      <p className="text-xs text-gray-500 font-bold">Task Type</p>
      <SelectComponent
        data={taskTypes.map((type) => ({
          id: type.task_type,
          label: type.display_name,
          type: type,
        }))}
        placeholder="Select Task Type"
        onSelectionChange={handleTaskTypeChange}
        selected={step?.taskType}
        searchable={true}
        disabled={isPrefetched}
      />
    </div>
  );
}

export default SelectTaskType;
