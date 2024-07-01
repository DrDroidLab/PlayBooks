import React from "react";
import { useSelector } from "react-redux";
import { playbookSelector } from "../../../../store/features/playbook/playbookSlice";
import useCurrentTask from "../../../../hooks/useCurrentTask";
import { updateCardById } from "../../../../utils/execution/updateCardById";
import SelectComponent from "../../../SelectComponent";

function SelectTaskType({ id }) {
  const { connectorOptions } = useSelector(playbookSelector);
  const [task, currentId] = useCurrentTask(id);
  const currentConnector = connectorOptions?.find(
    (e) => e.id === task?.source,
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
    if (!task?.ui_requirement?.userEnteredDescription)
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
        selected={task?.type}
        searchable={true}
      />
    </div>
  );
}

export default SelectTaskType;
