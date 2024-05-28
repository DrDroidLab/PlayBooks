import React from "react";
import SelectComponent from "../../SelectComponent";
import { useSelector } from "react-redux";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import { updateCardByIndex } from "../../../utils/execution/updateCardByIndex.ts";

function SelectTaskType() {
  const { currentStepIndex, connectorOptions, steps } =
    useSelector(playbookSelector);
  const step = steps[currentStepIndex];
  const isPrefetched = useIsPrefetched();

  const taskTypes =
    connectorOptions.find((e) => e.id === step?.source)?.connector
      ?.supported_task_type_options ?? [];

  function handleTaskTypeChange(id, val) {
    updateCardByIndex("taskType", id);
    updateCardByIndex("description", val.type.display_name);
  }

  return (
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
  );
}

export default SelectTaskType;
