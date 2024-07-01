import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  updateTaskType,
} from "../../../../store/features/playbook/playbookSlice.ts";
import useCurrentTask from "../../../../hooks/useCurrentTask.ts";
import { updateCardById } from "../../../../utils/execution/updateCardById.ts";
import SelectComponent from "../../../SelectComponent";

function SelectTaskType({ id }) {
  const { connectorOptions } = useSelector(playbookSelector);
  const [task, currentId] = useCurrentTask(id);
  const currentConnector = connectorOptions?.find(
    (e) => e.id === task?.source,
  )?.connector;
  const taskType = task?.[task?.source?.toLowerCase()]?.type;
  const dispatch = useDispatch();

  const taskTypes = currentConnector?.supported_task_type_options ?? [];

  function handleTaskTypeChange(id, val) {
    const currentTaskType = currentConnector?.supported_task_type_options?.find(
      (e) => e.task_type === id,
    );
    dispatch(updateTaskType({ id: currentId, value: id }));
    updateCardById(
      "ui_requirement.resultType",
      currentTaskType.result_type,
      currentId,
    );
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
        selected={taskType}
        searchable={true}
      />
    </div>
  );
}

export default SelectTaskType;
