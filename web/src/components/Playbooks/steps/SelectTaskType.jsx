import React from "react";
import SelectComponent from "../../SelectComponent";
import { useSelector } from "react-redux";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import { updateCardByIndex } from "../../../utils/execution/updateCardByIndex.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function SelectTaskType({ index }) {
  const { connectorOptions } = useSelector(playbookSelector);
  const [step, currentIndex] = useCurrentStep(index);
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
    updateCardByIndex("modelType", modelType, currentIndex);
    updateCardByIndex("taskType", id, currentIndex);
    if (!step.userEnteredDescription)
      updateCardByIndex("description", val.type.display_name, currentIndex);
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
