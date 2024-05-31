import React from "react";
import SelectComponent from "../../SelectComponent";
import { useSelector } from "react-redux";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import { updateCardByIndex } from "../../../utils/execution/updateCardByIndex.ts";
import useStepDetails from "../../../hooks/useStepDetails.ts";

function SelectTaskType() {
  const { connectorOptions } = useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();
  const { source, taskType } = useStepDetails();

  const taskTypes =
    connectorOptions.find((e) => e.id === source)?.connector
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
      selected={taskType}
      searchable={true}
      disabled={isPrefetched}
    />
  );
}

export default SelectTaskType;
